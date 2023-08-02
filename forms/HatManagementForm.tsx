import { Box, Button, Stack, Text } from '@chakra-ui/react';
import { useState } from 'react';
import { FaPlus, FaRegEdit, FaRegListAlt, FaShieldAlt } from 'react-icons/fa';

import AddressInput from '@/components/AddressInput';
import RadioBox from '@/components/atoms/RadioBox';
import FormRowWrapper from '@/components/FormRowWrapper';
import LabelWithLink from '@/components/LabelWithLink';
import { TRIGGER_OPTIONS } from '@/constants';
import { useOverlay } from '@/contexts/OverlayContext';
import { isTopHatOrMutable } from '@/lib/hats';
import { DetailsItem } from '@/types';

interface HatManagementFormProps {
  hatData: any;
  localForm: any;
  action: string; // eligibility or toggle
  actionResolvedAddress?: `0x${string}` | null;
  items: DetailsItem[];
  handleAddItem: (item: DetailsItem) => void;
  handleRemoveItem: (index: number) => void;
  setItems: (items: DetailsItem[]) => void;
  title: string;
  radioBoxConfig: {
    name: string;
    label: string;
    subLabel: string;
  };
}

const HatManagementForm = ({
  hatData,
  localForm,
  action,
  actionResolvedAddress,
  items,
  handleAddItem,
  handleRemoveItem,
  setItems,
  title,
  radioBoxConfig,
}: HatManagementFormProps) => {
  const { watch } = localForm;
  const isActionManual = watch(
    `is${action.charAt(0).toUpperCase() + action.slice(1)}Manual`,
  );
  const showActionResolvedAddress =
    actionResolvedAddress && actionResolvedAddress !== action;

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
    setInputLink(items[index].link);
    setCurrentItemIndex(index);
    setModals?.({
      [`editLabel-${title}`]: true,
    });
  };

  const handleSave = () => {
    if (isLinkValid) {
      const newArr = [...items];
      newArr[currentItemIndex].link = inputLink;
      setItems(newArr);
      setInputLink('');
      setCurrentItemIndex(0);
    }
    setModals?.({
      [`editLabel-${title}`]: false,
    });
  };

  const onChangeLabel = (e: any, index: number) => {
    const newArr = [...items];
    newArr[index].label = e.target.value;
    setItems(newArr);
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
            isDisabled={!isTopHatOrMutable(hatData)}
            resolvedAddress={String(actionResolvedAddress)}
          />
        </FormRowWrapper>
        <FormRowWrapper>
          <FaRegListAlt />
          <Stack>
            <Text>{action.toUpperCase()} REQUIREMENTS (optional)</Text>
            <Text fontWeight={400} color='blackAlpha.700'>
              A written description of the logic in the Accountability Module.
            </Text>
          </Stack>
        </FormRowWrapper>
        {items.map((item, index) => (
          <LabelWithLink
            // eslint-disable-next-line react/no-array-index-key
            key={title + index}
            item={item}
            title={title}
            handleRemoveItem={() => handleRemoveItem(index)}
            onChangeLabel={(e) => onChangeLabel(e, index)}
            handleEdit={() => handleEdit(index)}
            handleSave={handleSave}
            inputLink={inputLink}
            setInputLink={setInputLink}
            isLinkValid={isLinkValid}
            setIsLinkValid={setIsLinkValid}
          />
        ))}
        <Box mb={2}>
          <Button
            onClick={() => {
              handleAddItem({ link: '', label: '' });
            }}
            isDisabled={items.some((item) => item.label === '')}
            gap={2}
          >
            <FaPlus />
            Add {items.length ? 'another' : 'a'} Requirement
          </Button>
        </Box>
      </Stack>
    </form>
  );
};

export default HatManagementForm;
