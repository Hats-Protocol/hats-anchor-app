import { Box, Button, Flex, Stack, Text } from '@chakra-ui/react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FaKey, FaRegListAlt } from 'react-icons/fa';
import { useEnsAddress } from 'wagmi';

import Accordion from '@/components/atoms/Accordion';
import { MUTABILITY, ZERO_ADDRESS } from '@/constants';
import HatDeactivationReactivationForm from '@/forms/HatDeactivationReactivationForm';
import HatDetailsForm from '@/forms/HatDetailsForm';
import HatRevocationForm from '@/forms/HatRevocationForm';
import HatWearersForm from '@/forms/HatWearersForm';
import ItemDetailsForm from '@/forms/ItemDetailsForm';
import useDebounce from '@/hooks/useDebounce';
import useSubmitHatChanges from '@/hooks/useSubmitHatChanges';
import { idToPrettyId, prettyIdToIp } from '@/lib/hats';
import { DetailsItem, DetailsObject, IHat } from '@/types';

const EditMode = ({
  hatData,
  chainId,
  name,
  description,
  guilds,
  responsibilities: initialResponsibilities,
  authorities: initialAuthorities,
}: EditModeProps) => {
  const [newImageURI, setNewImageURI] = useState('');
  const [newDetails, setNewDetailsURI] = useState('');
  const [newDetailsData, setNewDetailsData] = useState<DetailsObject>();

  const localForm = useForm({
    mode: 'onChange',
    defaultValues: {
      maxSupply: hatData?.maxSupply,
      eligibility: hatData?.eligibility,
      toggle: hatData?.toggle,
      mutable: hatData?.mutable ? MUTABILITY.MUTABLE : MUTABILITY.IMMUTABLE,
      imageUrl: hatData?.imageUrl || '',
      name,
      description,
    },
  });

  const {
    handleSubmit,
    watch,
    formState: { dirtyFields },
  } = localForm;

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

  const [responsibilities, setResponsibilities] = useState(
    initialResponsibilities || [],
  );
  const handleAddResponsibility = ({ link, label }: DetailsItem) => {
    setResponsibilities([...responsibilities, { link, label }]);
  };

  const handleRemoveResponsibility = (index: number) => {
    setResponsibilities(responsibilities.filter((__, i) => i !== index));
  };

  const [authorities, setAuthorities] = useState(initialAuthorities || []);

  const handleAddAuthority = ({ link, label }: DetailsItem) => {
    setAuthorities([...authorities, { link, label }]);
  };

  const handleRemoveAuthority = (index: number) => {
    setAuthorities(authorities.filter((__, i) => i !== index));
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
            <HatDetailsForm
              localForm={localForm}
              hatData={hatData}
              chainId={chainId}
              setNewImageURI={setNewImageURI}
              setNewDetailsURI={setNewDetailsURI}
              setNewDetailsData={setNewDetailsData}
              responsibilities={responsibilities}
              authorities={authorities}
              defaultValues={{
                name,
                description,
                guilds,
              }}
            />
            <HatWearersForm localForm={localForm} hatData={hatData} />
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
            <HatRevocationForm
              localForm={localForm}
              hatData={hatData}
              eligibility={eligibility}
              eligibilityResolvedAddress={eligibilityResolvedAddress}
            />
          </Stack>
        </Accordion>

        <Accordion
          title='Deactivation & Reactivation'
          subtitle='The people or logic that control whether or not this hat is active.'
        >
          <Stack spacing={4}>
            <HatDeactivationReactivationForm
              localForm={localForm}
              hatData={hatData}
              toggle={toggle}
              toggleResolvedAddress={toggleResolvedAddress}
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
  name: string;
  description: string;
  guilds: string[];
  responsibilities: DetailsItem[];
  authorities: DetailsItem[];
}
