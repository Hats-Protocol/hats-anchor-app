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
import _ from 'lodash';
import { formatDistanceToNow } from 'date-fns';

import HatWearers from './HatWearers';
import AddressLink from '../AddressLink';
import DataTable from '../DataTable';

const accountabilitiesTable = [
  { label: 'Admin ID', value: '1234' },
  { label: 'Pretty Admin ID', value: '5' },
  { label: 'Eligibility', value: '0x1234' },
  { label: 'Toggle', value: '0x1234' },
];

const Hat = ({ hatData, chainId }) => {
  if (!hatData) return null;

  const wearers = _.get(hatData, 'wearers');

  const hatDetails = [
    {
      label: 'Id',
      value: hatData.prettyId, // TODO tooltip for long ID so it doesn't overflow table
    },
    {
      label: 'Status',
      value: hatData.status ? 'Active' : 'Not Active',
    },
    {
      label: 'Details',
      value: hatData.details,
    },
    {
      label: 'Image URI',
      value: hatData.imageUri,
    },
    {
      label: 'Max Supply',
      value: hatData.maxSupply,
    },
    {
      label: 'Current Supply',
      value: hatData.currentSupply,
    },
    {
      label: 'Eligibility',
      value: <AddressLink address={hatData.eligibility} chainId={chainId} />,
    },
    {
      label: 'Toggle',
      value: <AddressLink address={hatData.toggle} chainId={chainId} />,
    },
    {
      label: 'Mutable',
      value: hatData.mutable ? 'True' : 'False',
    },
    {
      label: 'Level',
      value: hatData.levelAtLocalTree,
    },
    {
      label: 'Created At',
      value: `${formatDistanceToNow(
        new Date(Number(hatData.createdAt) * 1000),
      )} ago`,
    },
  ];

  return (
    <Stack>
      <Heading as='h1'>Hat</Heading>
      <Tabs>
        <TabList>
          <Tab>Details</Tab>
          {/* <Tab>Authorities</Tab> */}
          <Tab>Accountabilities</Tab>
          <Tab>Wearers</Tab>
          <Tab>Admin</Tab>
        </TabList>
        <TabPanels>
          {/* Details, where is this coming back from? IPFS hash? */}
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
          {/* TODO Authorities will be designated in details for now, hard-ish to track */}
          {/* <TabPanel /> */}
          {/* TODO Accountabilities are found .... */}
          <TabPanel>
            <DataTable data={accountabilitiesTable} />
          </TabPanel>
          <TabPanel>
            {_.isEmpty(wearers) ? (
              <Text>No wearers</Text>
            ) : (
              <HatWearers wearers={wearers} chainId={chainId} />
            )}
          </TabPanel>
          <TabPanel />
        </TabPanels>
      </Tabs>
    </Stack>
  );
};

export default Hat;
