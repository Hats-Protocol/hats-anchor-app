import { Box, Button, Flex, Stack, Text } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FaKey, FaRegListAlt } from 'react-icons/fa';
import { useEnsAddress } from 'wagmi';

import Accordion from '@/components/atoms/Accordion';
import { MUTABILITY, TRIGGER_OPTIONS, ZERO_ADDRESS } from '@/constants';
import HatBasicsForm from '@/forms/HatBasicsForm';
import HatManagementForm from '@/forms/HatManagementForm';
import ItemDetailsForm from '@/forms/ItemDetailsForm';
import useDebounce from '@/hooks/useDebounce';
import useSubmitHatChanges from '@/hooks/useSubmitHatChanges';
import { idToPrettyId, prettyIdToIp } from '@/lib/hats';
import { DetailsObject, HatDetails, IHat } from '@/types';

const EditMode = ({
  hatData,
  chainId,
  hatDetails,
  setEditMode,
}: EditModeProps) => {
  const {
    name: initialName,
    description: initialDescription,
    guilds: initialGuilds,
    responsibilities: initialResponsibilities,
    authorities: initialAuthorities,
    eligibility: initialEligibility,
    toggle: initialToggle,
  } = hatDetails;

  const localForm = useForm({
    mode: 'onChange',
    defaultValues: {
      maxSupply: hatData?.maxSupply,
      eligibility: hatData?.eligibility,
      toggle: hatData?.toggle,
      mutable: hatData?.mutable ? MUTABILITY.MUTABLE : MUTABILITY.IMMUTABLE,
      imageUrl: hatData?.imageUrl || '',
      isEligibilityManual:
        initialEligibility?.manual || initialEligibility?.manual === undefined
          ? TRIGGER_OPTIONS.MANUALLY
          : TRIGGER_OPTIONS.AUTOMATICALLY,
      isToggleManual:
        initialToggle?.manual || initialToggle?.manual === undefined
          ? TRIGGER_OPTIONS.MANUALLY
          : TRIGGER_OPTIONS.AUTOMATICALLY,
      revocationsCriteria: initialEligibility?.criteria || [],
      deactivationsCriteria: initialToggle?.criteria || [],
      name: initialName,
      description: initialDescription,
      authorities: initialAuthorities,
      responsibilities: initialResponsibilities,
      guilds: initialGuilds,
    },
  });

  const {
    handleSubmit,
    watch,
    formState: { dirtyFields },
  } = localForm;

  const [newImageURI, setNewImageURI] = useState('');
  const [newDetailsData, setNewDetailsData] = useState<DetailsObject>();

  const eligibility = useDebounce(
    watch('eligibility', hatData?.eligibility || ZERO_ADDRESS),
  );
  const toggle = useDebounce(watch('toggle', hatData?.toggle || ZERO_ADDRESS));
  const maxSupply = useDebounce(watch('maxSupply', hatData?.maxSupply ?? 0));
  const imageUrl = useDebounce(watch('imageUrl', hatData?.imageUrl || ''));

  const {
    data: eligibilityResolvedAddress,
    isLoading: isLoadingEligibilityResolvedAddress,
  } = useEnsAddress({
    name: eligibility,
    chainId: 1,
  });

  const {
    data: toggleResolvedAddress,
    isLoading: isLoadingToggleResolvedAddress,
  } = useEnsAddress({
    name: toggle,
    chainId: 1,
  });

  const { onSubmit, isLoading } = useSubmitHatChanges({
    hatData,
    chainId,
    newImageURI,
    dirtyFields,
    newDetailsData,
    maxSupply,
    eligibility,
    toggle,
    eligibilityResolvedAddress,
    toggleResolvedAddress,
    imageUrl,
  });

  const name = useDebounce(watch('name', initialName || ''));
  const description = useDebounce(
    watch('description', initialDescription || ''),
  );
  const isEligibilityManual = useDebounce(watch('isEligibilityManual'));
  const isToggleManual = useDebounce(watch('isToggleManual'));
  const revocationsCriteria = useDebounce(watch('revocationsCriteria'));
  const deactivationsCriteria = useDebounce(watch('deactivationsCriteria'));
  const responsibilities = useDebounce(watch('responsibilities'));
  const authorities = useDebounce(watch('authorities'));
  const guilds = useDebounce(watch('guilds'));

  useEffect(() => {
    setNewDetailsData({
      name,
      description,
      guilds,
      responsibilities,
      authorities,
      eligibility: {
        manual: isEligibilityManual === TRIGGER_OPTIONS.MANUALLY,
        criteria: revocationsCriteria,
      },
      toggle: {
        manual: isToggleManual === TRIGGER_OPTIONS.MANUALLY,
        criteria: deactivationsCriteria,
      },
    });
  }, [
    name,
    description,
    guilds,
    responsibilities,
    authorities,
    revocationsCriteria,
    deactivationsCriteria,
    isEligibilityManual,
    isToggleManual,
  ]);

  const submitAndResetForm = async () => {
    const result = await onSubmit();
    if (result) {
      setTimeout(() => {
        setEditMode(false);
      }, 500);
    }
  };

  if (!hatData) return null;

  return (
    <Box w='100%' overflow='scroll' height='100%'>
      {/* Main Details */}
      <Stack
        position='relative'
        p={10}
        spacing={10}
        py='110px'
        overflow='auto'
        height='100%'
      >
        <Stack>
          <Text>{prettyIdToIp(idToPrettyId(hatData?.id))}</Text>
          <Text>All changes are local until you deploy to chain.</Text>
        </Stack>

        <Accordion
          title='Hat Basics'
          subtitle='The fundamentals of the hat, including name, image, and supply.'
        >
          <Stack spacing={4}>
            <HatBasicsForm
              localForm={localForm}
              hatData={hatData}
              chainId={chainId}
              setNewImageURI={setNewImageURI}
            />
          </Stack>
        </Accordion>

        <Accordion
          title='Powers'
          subtitle='Permissions and rights that are controlled by wearers of this hat.'
        >
          <Stack spacing={4}>
            <ItemDetailsForm
              localForm={localForm}
              formName='authorities'
              title='PERMISSIONS'
              label='Permission'
              Icon={FaKey}
            />
          </Stack>
        </Accordion>

        <Accordion
          title='Responsibilities'
          subtitle='Specific work that wearers of this hat will be held accountable for.'
        >
          <Stack spacing={4}>
            <ItemDetailsForm
              localForm={localForm}
              formName='responsibilities'
              title='RESPONSIBILITIES'
              label='Responsibility'
              Icon={FaRegListAlt}
            />
          </Stack>
        </Accordion>

        <Accordion
          title='Revocation'
          subtitle='The people or logic that determine when a wearer should have a hat.'
        >
          <Stack spacing={4}>
            <HatManagementForm
              localForm={localForm}
              hatData={hatData}
              address={eligibility}
              actionResolvedAddress={eligibilityResolvedAddress}
              title='eligibility'
              formName='revocationsCriteria'
              radioBoxConfig={{
                name: 'isEligibilityManual',
                label: 'Hat Revocation',
                subLabel: 'How should toggle from wearers be handled?',
              }}
            />
          </Stack>
        </Accordion>

        <Accordion
          title='Deactivation & Reactivation'
          subtitle='The people or logic that control whether or not this hat is active.'
        >
          <Stack spacing={4}>
            <HatManagementForm
              localForm={localForm}
              hatData={hatData}
              address={toggle}
              actionResolvedAddress={toggleResolvedAddress}
              title='toggle'
              formName='deactivationsCriteria'
              radioBoxConfig={{
                name: 'isToggleManual',
                label: 'Hat Deactivation',
                subLabel:
                  'How should deactivation and reactivation be handled?',
              }}
            />
          </Stack>
        </Accordion>

        <Flex justifyContent='flex-end'>
          <Button
            colorScheme='blue'
            onClick={handleSubmit(submitAndResetForm)}
            isLoading={
              isLoadingEligibilityResolvedAddress ||
              isLoadingToggleResolvedAddress ||
              isLoading
            }
          >
            Submit
          </Button>
        </Flex>
      </Stack>
    </Box>
  );
};

export default EditMode;

interface EditModeProps {
  hatData: IHat;
  chainId: number;
  hatDetails: HatDetails;
  setEditMode: (mode: boolean) => void;
}
