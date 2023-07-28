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

interface HatRevocationFormProps {
  hatData: any;
  localForm: any;
  eligibility: string;
  eligibilityResolvedAddress?: `0x${string}` | null;
  revocations: DetailsItem[];
  handleAddRevocation: (toggle: DetailsItem) => void;
  handleRemoveRevocation: (index: number) => void;
  setRevocations: (revocations: DetailsItem[]) => void;
}

const HatRevocationForm = ({
  hatData,
  localForm,
  eligibility,
  eligibilityResolvedAddress,
  revocations,
  handleAddRevocation,
  handleRemoveRevocation,
  setRevocations,
}: HatRevocationFormProps) => {
  const showEligibilityResolvedAddress =
    eligibilityResolvedAddress && eligibilityResolvedAddress !== eligibility;

  const options = [
    { value: TRIGGER_OPTIONS.MANUALLY, label: TRIGGER_OPTIONS.MANUALLY },
    {
      value: TRIGGER_OPTIONS.AUTOMATICALLY,
      label: TRIGGER_OPTIONS.AUTOMATICALLY,
    },
  ];

  const title = 'eligibility';

  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [isLinkValid, setIsLinkValid] = useState(false);
  const [inputLink, setInputLink] = useState('');
  const localOverlay = useOverlay();
  const { setModals } = localOverlay;

  const handleEdit = (index: number) => {
    setInputLink(revocations[index].link);
    setCurrentItemIndex(index);
    setModals?.({
      [`editLabel-${title}`]: true,
    });
  };

  const handleSave = () => {
    if (isLinkValid) {
      const newArr = [...revocations];
      newArr[currentItemIndex].link = inputLink;
      setRevocations(newArr);
      setInputLink('');
      setCurrentItemIndex(0);
    }
    setModals?.({
      [`editLabel-${title}`]: false,
    });
  };

  const onChangeLabel = (e: any, index: number) => {
    const newArr = [...revocations];
    newArr[index].label = e.target.value;
    setRevocations(newArr);
  };

  return (
    <form>
      <Stack spacing={6}>
        <RadioBox
          name='isEligibilityManual'
          label='Hat Revocation'
          subLabel='How should toggle from wearers be handled?'
          localForm={localForm}
          options={options}
        />
        <AddressInput
          name='eligibility'
          label='ELIGIBILITY'
          docsLink='https://docs.hatsprotocol.xyz/using-hats/setting-accountabilities/eligibility-requirements-for-wearers'
          localForm={localForm}
          showResolvedAddress={Boolean(showEligibilityResolvedAddress)}
          isDisabled={!isTopHatOrMutable(hatData)}
          resolvedAddress={String(eligibilityResolvedAddress)}
        />
        {revocations.map((item, index) => (
          <LabelWithLink
            // eslint-disable-next-line react/no-array-index-key
            key={title + index}
            item={item}
            title={title}
            handleRemoveItem={() => handleRemoveRevocation(index)}
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
          <Text>ELIGIBILITY REQUIREMENTS (optional)</Text>
          <Text fontWeight={400} color='blackAlpha.700'>
            A written description of the logic in the Accountability Module.
          </Text>
        </Stack>
        <Box mb={2}>
          <Button
            onClick={() => {
              handleAddRevocation({ link: '', label: '' });
            }}
            isDisabled={revocations.some((item) => item.label === '')}
            gap={2}
          >
            <FaPlus />
            Add {revocations.length ? 'another' : 'a'} Requirement
          </Button>
        </Box>
      </Stack>
    </form>
  );
};

export default HatRevocationForm;
