import { Box, Button, Stack, Text } from '@chakra-ui/react';
import { useState } from 'react';
import { FaPlus } from 'react-icons/fa';

import AddressInput from '@/components/AddressInput';
import RadioBox from '@/components/atoms/RadioBox';
import LabelWithLink from '@/components/LabelWithLink';
import { TRIGGER_OPTIONS } from '@/constants';
import { useOverlay } from '@/contexts/OverlayContext';
import { isTopHatOrMutable } from '@/lib/hats';
import { DetailsItem } from '@/types';

interface HatDeactivationReactivationFormProps {
  hatData: any;
  localForm: any;
  toggle: string;
  toggleResolvedAddress?: `0x${string}` | null;
  deactivations: DetailsItem[];
  setDeactivations: (deactivations: DetailsItem[]) => void;
  handleAddDeactivation: (item: DetailsItem) => void;
  handleRemoveDeactivation: (index: number) => void;
}

// should be combined with HatRevocationForm
const HatDeactivationReactivationForm = ({
  hatData,
  localForm,
  toggle,
  toggleResolvedAddress,
  deactivations,
  setDeactivations,
  handleAddDeactivation,
  handleRemoveDeactivation,
}: HatDeactivationReactivationFormProps) => {
  const showToggleResolvedAddress =
    toggleResolvedAddress && toggleResolvedAddress !== toggle;

  const options = [
    { value: TRIGGER_OPTIONS.MANUALLY, label: TRIGGER_OPTIONS.MANUALLY },
    {
      value: TRIGGER_OPTIONS.AUTOMATICALLY,
      label: TRIGGER_OPTIONS.AUTOMATICALLY,
    },
  ];

  const title = 'toggle';

  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [isLinkValid, setIsLinkValid] = useState(false);
  const [inputLink, setInputLink] = useState('');
  const localOverlay = useOverlay();
  const { setModals } = localOverlay;

  const handleEdit = (index: number) => {
    setInputLink(deactivations[index].link);
    setCurrentItemIndex(index);
    setModals?.({
      [`editLabel-${title}`]: true,
    });
  };

  const handleSave = () => {
    if (isLinkValid) {
      const newArr = [...deactivations];
      newArr[currentItemIndex].link = inputLink;
      setDeactivations(newArr);
      setInputLink('');
      setCurrentItemIndex(0);
    }
    setModals?.({
      [`editLabel-${title}`]: false,
    });
  };

  const onChangeLabel = (e: any, index: number) => {
    const newArr = [...deactivations];
    newArr[index].label = e.target.value;
    setDeactivations(newArr);
  };

  return (
    <form>
      <Stack spacing={6}>
        <RadioBox
          name='isToggleManual'
          label='Hat Deactivation'
          subLabel='How should hat deactivation and reactivation be handled?'
          localForm={localForm}
          options={options}
        />
        <AddressInput
          name='toggle'
          label='TOGGLE'
          docsLink='https://docs.hatsprotocol.xyz/using-hats/setting-accountabilities/toggle-activating-and-deactivating-hats'
          localForm={localForm}
          showResolvedAddress={Boolean(showToggleResolvedAddress)}
          isDisabled={!isTopHatOrMutable(hatData)}
          resolvedAddress={String(toggleResolvedAddress)}
        />
        {deactivations.map((item, index) => (
          <LabelWithLink
            // eslint-disable-next-line react/no-array-index-key
            key={title + index}
            item={item}
            title={title}
            handleRemoveItem={() => handleRemoveDeactivation(index)}
            onChangeLabel={(e) => onChangeLabel(e, index)}
            handleEdit={() => handleEdit(index)}
            handleSave={handleSave}
            inputLink={inputLink}
            setInputLink={setInputLink}
            isLinkValid={isLinkValid}
            setIsLinkValid={setIsLinkValid}
          />
        ))}
        <Stack>
          <Text>ACTIVATION REQUIREMENTS (optional)</Text>
          <Text fontWeight={400} color='blackAlpha.700'>
            A written description of the logic in the Accountability Module.
          </Text>
        </Stack>

        <Box mb={2}>
          <Button
            onClick={() => {
              handleAddDeactivation({ link: '', label: '' });
            }}
            isDisabled={deactivations.some((item) => item.label === '')}
            gap={2}
          >
            <FaPlus />
            Add {deactivations.length ? 'another' : 'a'} Requirement
          </Button>
        </Box>
      </Stack>
    </form>
  );
};

export default HatDeactivationReactivationForm;
