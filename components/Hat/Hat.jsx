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
  HStack,
  Image,
  Badge,
} from '@chakra-ui/react';
import _ from 'lodash';
import { formatDistanceToNow } from 'date-fns';

import HatWearers from './HatWearers';
import AddressLink from '../AddressLink';
import DataTable from '../DataTable';
import { ZERO_ADDRESS } from '../../constants';

const Hat = ({ hatData, chainId }) => {
  if (!hatData) return null;

  const wearers = _.get(hatData, 'wearers');

  const hatDetails = [
    {
      label: 'Max Supply',
      value: hatData.maxSupply,
    },
    {
      label: 'Current Supply',
      value: hatData.currentSupply,
    },
    {
      label: 'Level',
      value: hatData.levelAtLocalTree || '0',
    },
    {
      label: 'Created At',
      value: `${formatDistanceToNow(
        new Date(Number(hatData.createdAt) * 1000),
      )} ago`,
    },
  ];

  const accountabilitiesTable = [
    { label: 'Admin ID', value: '1234' },
    { label: 'Pretty Admin ID', value: '5' },
    {
      label: 'Eligibility',
      value:
        hatData.eligibility !== ZERO_ADDRESS ? (
          <AddressLink address={hatData.eligibility} chainId={chainId} />
        ) : (
          'None Set'
        ),
    },
    {
      label: 'Toggle',
      value:
        hatData.toggle !== ZERO_ADDRESS ? (
          <AddressLink address={hatData.toggle} chainId={chainId} />
        ) : (
          'None Set'
        ),
    },
  ];

  return (
    <Stack>
      <Flex justify='space-between'>
        <HStack spacing={4}>
          <Image
            src='/icon.jpeg'
            alt='Hat icon'
            maxW='75px'
            border='1px solid'
            borderColor='gray.200'
          />
          <Stack spacing={1}>
            <Heading size='md'>Top Hat</Heading>
            <Text fontSize='sm'>Hat ID {_.get(hatData, 'prettyId')}</Text>
          </Stack>
        </HStack>
        <HStack>
          <Badge>{hatData.status ? 'Active' : 'Inactive'}</Badge>
          <Badge>{hatData.mutable ? 'Mutable' : 'Immutable'}</Badge>
        </HStack>
      </Flex>

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
            <DataTable data={hatDetails} />
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
