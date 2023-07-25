import {
  Box,
  Button,
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
import { useAccount, useEnsAddress } from 'wagmi';

import Accordion from '@/components/atoms/Accordion';
import { MUTABILITY, ZERO_ADDRESS } from '@/constants';
import HatAdminsForm from '@/forms/HatAdminsForm';
import HatDetailsForm from '@/forms/HatDetailsForm';
import HatWearersForm from '@/forms/HatWearersForm';
import useDebounce from '@/hooks/useDebounce';
import useToast from '@/hooks/useToast';
import { decimalId, idToPrettyId, prettyIdToIp } from '@/lib/hats';
import { createHatsClient } from '@/lib/web3';
import { DetailsItem, IHat } from '@/types';

const EditMode = ({
  hatData,
  chainId,
  name,
  description,
  guilds,
  imageUrl,
  responsibilities,
  authorities,
}: EditModeProps) => {
  const account = useAccount();
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const localForm = useForm({
    mode: 'onChange',
    defaultValues: {
      maxSupply: hatData?.maxSupply,
      eligibility: hatData?.eligibility,
      toggle: hatData?.toggle,
      mutable: hatData?.mutable ? MUTABILITY.MUTABLE : MUTABILITY.IMMUTABLE,
    },
  });
  const {
    handleSubmit,
    watch,
    formState: { dirtyFields },
  } = localForm;

  // Watch for changes
  const eligibility = useDebounce(
    watch('eligibility', hatData?.eligibility || ZERO_ADDRESS),
  );
  const toggle = useDebounce(watch('toggle', hatData?.toggle || ZERO_ADDRESS));
  const maxSupply = useDebounce(watch('maxSupply', hatData?.maxSupply ?? 0));
  const mutable = useDebounce(
    watch(
      'mutable',
      hatData?.mutable ? MUTABILITY.MUTABLE : MUTABILITY.IMMUTABLE,
    ),
  );

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

  const hatsClient = createHatsClient(chainId);

  const onSubmit = async () => {
    const calls = [];

    if (dirtyFields.maxSupply) {
      try {
        const callData = await hatsClient.changeHatMaxSupplyCallData({
          hatId: decimalId(hatData?.id) as unknown as bigint,
          newMaxSupply: maxSupply as number,
        });

        calls.push(callData);
      } catch (error: unknown) {
        toast.error({
          title: 'Error occured',
          description:
            error instanceof Error
              ? error.message
              : 'An unknown error occurred',
        });
        return;
      }
    }

    if (dirtyFields.eligibility) {
      try {
        const callData = await hatsClient.changeHatEligibilityCallData({
          hatId: decimalId(hatData?.id) as unknown as bigint,
          newEligibility: eligibilityResolvedAddress ?? eligibility,
        });

        calls.push(callData);
      } catch (error: unknown) {
        toast.error({
          title: 'Error occured',
          description:
            error instanceof Error
              ? error.message
              : 'An unknown error occurred',
        });
        return;
      }
    }

    if (dirtyFields.toggle) {
      try {
        const callData = await hatsClient.changeHatToggleCallData({
          hatId: decimalId(hatData?.id) as unknown as bigint,
          newToggle: toggleResolvedAddress ?? toggle,
        });

        calls.push(callData);
      } catch (error: unknown) {
        toast.error({
          title: 'Error occured',
          description:
            error instanceof Error
              ? error.message
              : 'An unknown error occurred',
        });
        return;
      }
    }

    if (dirtyFields.mutable) {
      try {
        const callData = await hatsClient.makeHatImmutableCallData({
          hatId: decimalId(hatData?.id) as unknown as bigint,
        });

        calls.push(callData);
      } catch (error: unknown) {
        toast.error({
          title: 'Error occured',
          description:
            error instanceof Error
              ? error.message
              : 'An unknown error occurred',
        });
        return;
      }
    }

    if (calls.length > 0) {
      setIsLoading(true);
      try {
        await hatsClient.multicall({
          account: account.address as `0x${string}`,
          calls,
        });
        setIsLoading(false);

        toast.success({
          title: 'Transaction successful',
          description: 'Hat was successfully updated',
        });
      } catch (error: unknown) {
        toast.error({
          title: 'Error occurred!',
          description:
            error instanceof Error
              ? error.message
              : 'An unknown error occurred',
        });

        setIsLoading(false);
      }
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
          <Text>{name}</Text>
          <Text>{description}</Text>
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
                    hatData={hatData}
                    chainId={chainId}
                    defaultValues={{
                      name,
                      description,
                      imageUrl,
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

            <Button
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
                  !dirtyFields.toggle) ||
                maxSupply < 0
              }
            >
              Submit
            </Button>
          </Stack>
        </Accordion>
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
  imageUrl: string;
  responsibilities: DetailsItem[];
  authorities: DetailsItem[];
}
