import { Box, Button, Stack, Text } from '@chakra-ui/react';
import { useState } from 'react';
import { useFieldArray } from 'react-hook-form';
import { FaPlus, FaRegEdit, FaRegListAlt, FaShieldAlt } from 'react-icons/fa';

import AddressInput from '@/components/AddressInput';
import RadioBox from '@/components/atoms/RadioBox';
import FormRowWrapper from '@/components/FormRowWrapper';
import LabelWithLink from '@/components/LabelWithLink';
import { TRIGGER_OPTIONS } from '@/constants';
import { useOverlay } from '@/contexts/OverlayContext';
import { isMutable, isTopHatOrMutable } from '@/lib/hats';
import { DetailsItem } from '@/types';

interface HatManagementFormProps {
  hatData: any;
  localForm: any;
  address: string; // eligibility or toggle
  actionResolvedAddress?: `0x${string}` | null;
  title: string;
  formName: string;
  radioBoxConfig: {
    name: string;
    label: string;
    subLabel: string;
  };
}

const HatManagementForm = ({
  hatData,
  localForm,
  address,
  actionResolvedAddress,
  title,
  formName,
  radioBoxConfig,
}: HatManagementFormProps) => {
  const { watch, control, setValue, getValues } = localForm;

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
            isDisabled={!isMutable(hatData)}
            resolvedAddress={String(actionResolvedAddress)}
          />
        </FormRowWrapper>
        <FormRowWrapper>
          <FaRegListAlt />
          <Stack>
            <Text>{address.toUpperCase()} REQUIREMENTS (optional)</Text>
            <Text color='blackAlpha.700'>
              A written description of the logic in the Accountability Module.
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
            isDisabled={items?.some((item: DetailsItem) => item.label === '')}
            gap={2}
          >
            <FaPlus />
            Add {items?.length ? 'another' : 'a'} Requirement
          </Button>
        </Box>
      </Stack>
    </form>
  );
};

export default HatManagementForm;
