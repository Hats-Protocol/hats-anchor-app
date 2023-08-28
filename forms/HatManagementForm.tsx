import { Box, Button, HStack, Icon, Stack, Text } from '@chakra-ui/react';
import _ from 'lodash';
import { useState } from 'react';
import { useFieldArray, UseFormReturn } from 'react-hook-form';
import { BsListUl, BsPlusCircle, BsShieldLock } from 'react-icons/bs';
import { GrEdit } from 'react-icons/gr';
import { Hex } from 'viem';

import AddressInput from '@/components/AddressInput';
import RadioBox from '@/components/atoms/RadioBox';
import FormRowWrapper from '@/components/FormRowWrapper';
import LabelWithLink from '@/components/LabelWithLink';
import { FALLBACK_ADDRESS, TRIGGER_OPTIONS } from '@/constants';
import { useOverlay } from '@/contexts/OverlayContext';
import { useTreeForm } from '@/contexts/TreeFormContext';
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
  inputConfig: {
    label: string;
    description: string;
  };
  criteriaConfig: {
    label: string;
    description: string;
    addButtonLabel: string;
  };
}

const HatManagementForm = ({
  localForm,
  address,
  actionResolvedAddress,
  title,
  formName,
  radioBoxConfig,
  inputConfig,
  criteriaConfig,
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
      <Stack spacing={8}>
        <FormRowWrapper>
          <Icon as={GrEdit} boxSize={4} mt='2px' />
          <RadioBox
            name={radioBoxConfig.name}
            label={radioBoxConfig.label}
            subLabel={radioBoxConfig.subLabel}
            localForm={localForm}
            options={options}
          />
        </FormRowWrapper>
        <FormRowWrapper>
          <Icon as={BsShieldLock} boxSize={4} mt='2px' />
          <AddressInput
            name={title}
            label={`${inputConfig.label} ${
              isActionManual === TRIGGER_OPTIONS.MANUALLY ? 'ADDRESS' : 'MODULE'
            }`}
            subLabel={inputConfig.description}
            docsLink={`https://docs.hatsprotocol.xyz/using-hats/setting-accountabilities/${title}-requirements-for-wearers`}
            localForm={localForm}
            showResolvedAddress={Boolean(showActionResolvedAddress)}
            isDisabled={!isMutable(selectedHat)}
            resolvedAddress={String(actionResolvedAddress)}
          />
        </FormRowWrapper>
        {address !== FALLBACK_ADDRESS && (
          <FormRowWrapper>
            <Icon as={BsListUl} boxSize={4} mt='3px' />
            <Stack>
              <HStack fontSize='sm'>
                <Text color='blackAlpha.800' fontWeight='medium'>
                  {criteriaConfig.label}
                </Text>
                <Text color='blackAlpha.600'>optional</Text>
              </HStack>
              <Text color='blackAlpha.700'>{criteriaConfig.description}</Text>
            </Stack>
          </FormRowWrapper>
        )}
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
            isDisabled={items?.some((item: DetailsItem) => item.label === '')}
            gap={2}
            variant='outline'
            borderColor='blackAlpha.300'
          >
            <BsPlusCircle />
            Add {items?.length ? 'another' : 'a'}{' '}
            {criteriaConfig.addButtonLabel}
          </Button>
        </Box>
      </Stack>
    </form>
  );
};

export default HatManagementForm;
