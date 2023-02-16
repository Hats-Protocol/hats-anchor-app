import {
  Heading,
  Stack,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Flex,
  Text,
} from '@chakra-ui/react';
import { formatDistanceToNow } from 'date-fns';

import HatWearers from './HatWearers';
import AddressLink from '../AddressLink';

const Hat = ({ hatData, chainId }) => {
  if (!hatData?.hat) return null;

  const hatDetails = [
    {
      label: 'Id',
      value: hatData.hat.id,
    },
    {
      label: 'Status',
      value: hatData.hat.status ? 'Active' : 'Not Active',
    },
    {
      label: 'Details',
      value: hatData.hat.details,
    },
    {
      label: 'Image URI',
      value: hatData.hat.imageUri,
    },
    {
      label: 'Max Supply',
      value: hatData.hat.maxSupply,
    },
    {
      label: 'Current Supply',
      value: hatData.hat.currentSupply,
    },
    {
      label: 'Eligibility',
      value: (
        <AddressLink address={hatData.hat.eligibility} chainId={chainId} />
      ),
    },
    {
      label: 'Toggle',
      value: <AddressLink address={hatData.hat.toggle} chainId={chainId} />,
    },
    {
      label: 'Mutable',
      value: hatData.hat.mutable ? 'True' : 'False',
    },
    {
      label: 'Level',
      value: hatData.hat.levelAtLocalTree,
    },
    {
      label: 'Created At',
      value: `${formatDistanceToNow(
        new Date(Number(hatData.hat.createdAt) * 1000),
      )} ago`,
    },
  ];

  return (
    <Stack>
      <Heading as='h1'>Hat</Heading>
      <Tabs>
        <TabList>
          <Tab>Basic Info</Tab>
          <Tab>Wearers</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            {hatDetails.map((detail) => (
              <Flex
                key={`${detail.label}-${detail.value}`}
                justify='space-between'
              >
                <Text>{detail.label}</Text>
                <Text>{detail.value}</Text>
              </Flex>
            ))}
          </TabPanel>
          <TabPanel>
            <HatWearers hatData={hatData} chainId={chainId} />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Stack>
  );
};

export default Hat;
