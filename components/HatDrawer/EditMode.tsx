import {
  Box,
  Button,
  Flex,
  Stack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
} from '@chakra-ui/react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useEnsAddress } from 'wagmi';

import Accordion from '@/components/atoms/Accordion';
import { MUTABILITY, ZERO_ADDRESS } from '@/constants';
import HatAdminsForm from '@/forms/HatAdminsForm';
import HatDetailsForm from '@/forms/HatDetailsForm';
import HatWearersForm from '@/forms/HatWearersForm';
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
  responsibilities,
  authorities,
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
  console.log('dirtyFields', dirtyFields);

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

  console.log('imageUrl === newImageURI', imageUrl === newImageURI);
  console.log('newImageURI', newImageURI);
  console.log('imageUrl', imageUrl);
  console.log('hatData.details === newDetails', hatData.details === newDetails);

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

        <Accordion title='Hat Details'>
          <Stack spacing={4}>
            <Text>Describe the role that this Hat symbolizes.</Text>
            <Tabs>
              <TabList>
                <Tab>Basic</Tab>
              </TabList>

              <TabPanels>
                <TabPanel px={0}>
                  <HatDetailsForm
                    localForm={localForm}
                    hatData={hatData}
                    chainId={chainId}
                    setNewImageURI={setNewImageURI}
                    setNewDetailsURI={setNewDetailsURI}
                    setNewDetailsData={setNewDetailsData}
                    defaultValues={{
                      name,
                      description,
                      guilds,
                      responsibilities,
                      authorities,
                    }}
                  />
                </TabPanel>
              </TabPanels>
            </Tabs>
          </Stack>
        </Accordion>

        <Accordion title='Wearers & Administrators'>
          <Stack spacing={4}>
            <Text>
              The people and contracts that control and wear this Hat.
            </Text>
            <HatWearersForm
              localForm={localForm}
              hatData={hatData}
              defaultAdmin={hatData.admin?.prettyId}
            />
            <HatAdminsForm
              localForm={localForm}
              hatData={hatData}
              eligibility={eligibility}
              toggle={toggle}
              eligibilityResolvedAddress={eligibilityResolvedAddress}
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
