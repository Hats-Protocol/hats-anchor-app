import { Box, Button, Flex, Stack, Text } from '@chakra-ui/react';
import { useState } from 'react';
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
import { DetailsItem, DetailsObject, HatDetails, IHat } from '@/types';

const EditMode = ({ hatData, chainId, hatDetails }: EditModeProps) => {
  const {
    name,
    description,
    guilds,
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
      name,
      description,
    },
  });

  const {
    handleSubmit,
    watch,
    formState: { dirtyFields },
  } = localForm;

  const [newImageURI, setNewImageURI] = useState('');
  const [newDetails, setNewDetailsURI] = useState('');
  const [newDetailsData, setNewDetailsData] = useState<DetailsObject>();
  const [responsibilities, setResponsibilities] = useState(
    initialResponsibilities || [],
  );
  const [authorities, setAuthorities] = useState(initialAuthorities || []);
  const [revocations, setRevocations] = useState(
    initialEligibility?.criteria || [],
  );
  const [deactivations, setDeactivations] = useState(
    initialToggle?.criteria || [],
  );

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
    newDetails,
    dirtyFields,
    newDetailsData,
    maxSupply,
    eligibility,
    toggle,
    eligibilityResolvedAddress,
    toggleResolvedAddress,
    imageUrl,
  });

  const handleAddResponsibility = ({ link, label }: DetailsItem) => {
    setResponsibilities([...responsibilities, { link, label }]);
  };

  const handleRemoveResponsibility = (index: number) => {
    setResponsibilities(responsibilities.filter((__, i) => i !== index));
  };

  const handleAddAuthority = ({ link, label }: DetailsItem) => {
    setAuthorities([...authorities, { link, label }]);
  };

  const handleRemoveAuthority = (index: number) => {
    setAuthorities(authorities.filter((__, i) => i !== index));
  };

  const handleAddRevocation = ({ link, label }: DetailsItem) => {
    setRevocations([...revocations, { link, label }]);
  };

  const handleRemoveRevocation = (index: number) => {
    setRevocations(revocations.filter((__, i) => i !== index));
  };

  const handleAddDeactivation = ({ link, label }: DetailsItem) => {
    setDeactivations([...deactivations, { link, label }]);
  };

  const handleRemoveDeactivation = (index: number) => {
    setDeactivations(deactivations.filter((__, i) => i !== index));
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
              setNewDetailsURI={setNewDetailsURI}
              setNewDetailsData={setNewDetailsData}
              newDetailsData={newDetailsData}
              responsibilities={responsibilities}
              authorities={authorities}
              revocations={revocations}
              deactivations={deactivations}
              defaultValues={{
                name,
                description,
                guilds,
              }}
            />
          </Stack>
        </Accordion>

        <Accordion
          title='Powers'
          subtitle='Permissions and rights that are controlled by wearers of this hat.'
        >
          <Stack spacing={4}>
            <ItemDetailsForm
              items={authorities}
              setItems={setAuthorities}
              handleAddItem={handleAddAuthority}
              handleRemoveItem={handleRemoveAuthority}
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
              items={responsibilities}
              setItems={setResponsibilities}
              handleAddItem={handleAddResponsibility}
              handleRemoveItem={handleRemoveResponsibility}
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
              action={eligibility}
              actionResolvedAddress={eligibilityResolvedAddress}
              items={revocations}
              setItems={setRevocations}
              handleAddItem={handleAddRevocation}
              handleRemoveItem={handleRemoveRevocation}
              title='eligibility'
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
              action={toggle}
              actionResolvedAddress={toggleResolvedAddress}
              items={deactivations}
              handleAddItem={handleAddDeactivation}
              handleRemoveItem={handleRemoveDeactivation}
              setItems={setDeactivations}
              title='toggle'
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
            onClick={handleSubmit(onSubmit)}
            isLoading={
              isLoadingEligibilityResolvedAddress ||
              isLoadingToggleResolvedAddress ||
              isLoading
            }
            isDisabled={
              hatData.levelAtLocalTree === 0 ||
              (!dirtyFields.maxSupply &&
                !dirtyFields.mutable &&
                !dirtyFields.eligibility &&
                !dirtyFields.toggle &&
                !dirtyFields.imageUrl &&
                (!newImageURI || imageUrl === newImageURI) &&
                hatData.details === newDetails) ||
              maxSupply < 0
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
}
