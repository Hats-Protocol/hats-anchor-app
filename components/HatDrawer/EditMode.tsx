import {
  Box,
  Stack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
} from '@chakra-ui/react';
import { HatsClient } from '@hatsprotocol/sdk-v1-core';
import { useForm } from 'react-hook-form';
import { goerli } from 'viem/chains';
import { createPublicClient, createWalletClient, http } from 'viem-hats-client';
import { useAccount } from 'wagmi';

import Accordion from '@/components/atoms/Accordion';
import { MUTABILITY, ZERO_ADDRESS } from '@/constants';
import HatAdminsForm from '@/forms/HatAdminsForm';
import HatDetailsForm from '@/forms/HatDetailsForm';
import HatWearersForm from '@/forms/HatWearersForm';
import useDebounce from '@/hooks/useDebounce';
import { idToPrettyId, prettyIdToIp } from '@/lib/hats';
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
  isAdminUser,
}: EditModeProps) => {
  const { address } = useAccount();
  const localForm = useForm({
    mode: 'onChange',
    defaultValues: {
      maxSupply: hatData?.maxSupply,
      eligibility: hatData?.eligibility,
      toggle: hatData?.toggle,
      mutable: hatData?.mutable ? MUTABILITY.MUTABLE : MUTABILITY.IMMUTABLE,
    },
  });
  const { watch } = localForm;

  const eligibility = useDebounce(
    watch('eligibility', hatData?.eligibility || ZERO_ADDRESS),
  );
  const toggle = useDebounce(watch('toggle', hatData?.toggle || ZERO_ADDRESS));
  const maxSupply = useDebounce(watch('maxSupply', hatData?.maxSupply));
  const mutable = useDebounce(
    watch(
      'mutable',
      hatData?.mutable ? MUTABILITY.MUTABLE : MUTABILITY.IMMUTABLE,
    ),
  );

  const publicClient = createPublicClient({
    chain: goerli,
    transport: http(),
  });

  const walletClient = createWalletClient({
    account: address,
    chain: goerli,
    transport: http(),
  });

  const hatsClient = new HatsClient({
    chainId,
    publicClient,
    walletClient,
  });

  console.log('hatsClient', hatsClient);

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
              defaultAdmin={hatData.admin?.prettyId}
              chainId={chainId}
              hatData={hatData}
              levelAtLocalTree={hatData.levelAtLocalTree}
              isAdminUser={isAdminUser}
              localForm={localForm}
              maxSupply={maxSupply}
              mutable={mutable === MUTABILITY.MUTABLE}
            />
            <HatAdminsForm
              chainId={chainId}
              hatData={hatData}
              localForm={localForm}
              eligibility={eligibility}
              toggle={toggle}
            />
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
  isAdminUser: boolean;
}
