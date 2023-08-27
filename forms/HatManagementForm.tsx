import { Box, Button, HStack, Stack, Text } from '@chakra-ui/react';
import _ from 'lodash';
import { useState } from 'react';
import { useFieldArray, UseFormReturn } from 'react-hook-form';
import { FaPlus, FaRegEdit, FaRegListAlt, FaShieldAlt } from 'react-icons/fa';
import { Hex } from 'viem';

import AddressInput from '@/components/AddressInput';
import RadioBox from '@/components/atoms/RadioBox';
import FormRowWrapper from '@/components/FormRowWrapper';
import LabelWithLink from '@/components/LabelWithLink';
import { FALLBACK_ADDRESS, TRIGGER_OPTIONS } from '@/constants';
import { useOverlay } from '@/contexts/OverlayContext';
import { useTreeForm } from '@/contexts/TreeFormContext';
import { formatAddress } from '@/lib/general';
import { isMutable } from '@/lib/hats';
import { DetailsItem } from '@/types';

interface HatManagementFormProps {
  localForm: UseFormReturn<any>;
  address: Hex | undefined; // eligibility or toggle
  actionResolvedAddress?: Hex | null;
  title: string;
  formName: string;
  radioBoxConfig: {
    name: string;
    label: string;
    subLabel: string;
  };
}

const HatManagementForm = ({
  localForm,
  address,
  actionResolvedAddress,
  title,
  formName,
  radioBoxConfig,
}: HatManagementFormProps) => {
  const { watch, control, setValue, getValues } = localForm;
  const { selectedHat } = useTreeForm();

  const { fields, append, remove } = useFieldArray({
    control,
    name: formName,
  });

  const items = watch(formName);

  const isActionManual = watch(radioBoxConfig.name);
  const showActionResolvedAddress =
    actionResolvedAddress && actionResolvedAddress !== address;

  const options = [
    { value: TRIGGER_OPTIONS.MANUALLY, label: TRIGGER_OPTIONS.MANUALLY },
    {
      value: TRIGGER_OPTIONS.AUTOMATICALLY,
      label: TRIGGER_OPTIONS.AUTOMATICALLY,
    },
  ];

  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [isLinkValid, setIsLinkValid] = useState(false);
  const [inputLink, setInputLink] = useState('');
  const localOverlay = useOverlay();
  const { setModals } = localOverlay;

  const handleEdit = (index: number) => {
    const itemsArray = getValues(formName);
    setInputLink(itemsArray[index].link);
    setCurrentItemIndex(index);
    setModals?.({
      [`editLabel-${title}`]: true,
    });
  };

  const handleSave = () => {
    if (isLinkValid) {
      setValue(`${formName}.${currentItemIndex}.link`, inputLink);
      setInputLink('');
      setCurrentItemIndex(0);
    }
    setModals?.({
      [`editLabel-${title}`]: false,
    });
  };

  return (
    <form>
      <Stack spacing={6}>
        <FormRowWrapper>
          <FaRegEdit />
          <RadioBox
            name={radioBoxConfig.name}
            label={radioBoxConfig.label}
            subLabel={radioBoxConfig.subLabel}
            localForm={localForm}
            options={options}
          />
        </FormRowWrapper>
        <FormRowWrapper>
          <FaShieldAlt />
          <AddressInput
            name={title}
            label={`ACCOUNTABILITY ${
              isActionManual === TRIGGER_OPTIONS.MANUALLY ? 'ADDRESS' : 'MODULE'
            }`}
            docsLink={`https://docs.hatsprotocol.xyz/using-hats/setting-accountabilities/${title}-requirements-for-wearers`}
            localForm={localForm}
            showResolvedAddress={Boolean(showActionResolvedAddress)}
            isDisabled={!isMutable(selectedHat)}
            resolvedAddress={String(actionResolvedAddress)}
          />
        </FormRowWrapper>
        {address !== FALLBACK_ADDRESS && (
          <>
            <FormRowWrapper>
              <Stack>
                <HStack>
                  {' '}
                  <FaRegListAlt />
                  <Text>
                    {address?.includes('.eth')
                      ? _.toUpper(address)
                      : formatAddress(address)}{' '}
                    REQUIREMENTS (optional)
                  </Text>
                </HStack>

                <Text color='blackAlpha.700'>
                  A written description of the logic in the Accountability
                  Module.
                </Text>
              </Stack>
            </FormRowWrapper>
            {fields.map((field, index) => (
              <LabelWithLink
                key={field.id}
                localForm={localForm}
                title={title}
                handleRemoveItem={() => remove(index)}
                handleEdit={() => handleEdit(index)}
                handleSave={handleSave}
                inputLink={inputLink}
                setInputLink={setInputLink}
                isLinkValid={isLinkValid}
                setIsLinkValid={setIsLinkValid}
                labelName={`${formName}.${index}.label`}
                linkName={`${formName}.${index}.link`}
              />
            ))}

            <Box mb={2}>
              <Button
                onClick={() => append({ link: '', label: '' })}
                isDisabled={items?.some(
                  (item: DetailsItem) => item.label === '',
                )}
                gap={2}
              >
                <FaPlus />
                Add {items?.length ? 'another' : 'a'} Requirement
              </Button>
            </Box>
          </>
        )}
      </Stack>
    </form>
  );
};

export default HatManagementForm;
