import {
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
  Icon,
  IconButton,
} from '@chakra-ui/react';
import { useState } from 'react';
import _ from 'lodash';
import { formatDistanceToNow } from 'date-fns';
import { FaPencilAlt } from 'react-icons/fa';

import HatWearers from './HatWearers';
import AddressLink from '../AddressLink';
import DataTable from '../DataTable';
import { ZERO_ADDRESS } from '../../constants';
import Modal from '../Modal';
import HatModulesForm from '../../forms/HatModulesForm';
import { useOverlay } from '../../contexts/OverlayContext';

const MODULE_TYPES = {
  eligibility: 'ELIGIBILITY',
  toggle: 'TOGGLE',
};

const AddressRow = ({ address, chainId, type, setType, localOverlay }) => {
  const { setModals } = localOverlay;

  const openModal = () => {
    setType(type);
    setModals({ editModule: true });
  };

  return (
    <HStack spacing={4}>
      {address !== ZERO_ADDRESS ? (
        <AddressLink address={address} chainId={chainId} />
      ) : (
        <Text>None Set</Text>
      )}
      <IconButton
        icon={<Icon as={FaPencilAlt} h='12px' w='12px' />}
        minW='auto'
        w={8}
        h={8}
        variant='outline'
      />
    </HStack>
  );
};
// TODO this should probably be more components

const Hat = ({ hatData, hatEvents, chainId }) => {
  const localOverlay = useOverlay();
  const [type, setType] = useState(MODULE_TYPES.eligibility);
  if (!hatData) return null;
  console.log(hatData);

  const accountabilitiesTable = [
    { label: 'Admin ID', value: '1234' },
    { label: 'Pretty Admin ID', value: '5' },
    {
      label: 'Eligibility',
      value: (
        <AddressRow
          address={hatData.eligibility}
          chainId={chainId}
          type={MODULE_TYPES.eligibility}
          setType={setType}
          localOverlay={localOverlay}
        />
      ),
    },
    {
      label: 'Toggle',
      value: (
        <AddressRow
          address={hatData.toggle}
          chainId={chainId}
          type={MODULE_TYPES.eligibility}
          setType={setType}
          localOverlay={localOverlay}
        />
      ),
    },
  ];

  return (
    <>
      <Modal name='editModule' title='Edit Module' localOverlay={localOverlay}>
        <HatModulesForm />
      </Modal>

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
              {/* TODO add name if found in details object */}
              <Text fontSize='sm'>Hat ID {_.get(hatData, 'prettyId')}</Text>
              <Text
                fontSize='xs'
                color='gray.500'
              >{`Created ${formatDistanceToNow(
                new Date(Number(hatData.createdAt) * 1000),
              )} ago`}</Text>
            </Stack>
          </HStack>
          <Stack textAlign='center' spacing={1}>
            <Badge colorScheme={hatData.status ? 'green' : 'blue'}>
              {hatData.status ? 'Active' : 'Inactive'}
            </Badge>
            <Badge colorScheme={hatData.mutable ? 'green' : 'blue'}>
              {hatData.mutable ? 'Mutable' : 'Immutable'}
            </Badge>
            {hatData?.levelAtLocalTree === 0 ? (
              <Badge colorScheme='purple'>Top Hat</Badge>
            ) : (
              <Badge colorScheme='purple'>
                Level {hatData?.levelAtLocalTree}
              </Badge>
            )}
          </Stack>
        </Flex>

        <Tabs>
          <TabList>
            <Tab>Details</Tab>
            {/* <Tab>Authorities</Tab> */}
            <Tab>Accountabilities</Tab>
            <Tab>Wearers</Tab>
            <Tab>Events</Tab>
          </TabList>
          <TabPanels>
            {/* Details, where is this coming back from? IPFS hash? */}
            <TabPanel>{hatData?.details}</TabPanel>
            {/* TODO Authorities will be designated in details for now, hard-ish to track */}
            {/* <TabPanel /> */}
            {/* TODO Accountabilities are found .... */}
            <TabPanel>
              <DataTable data={accountabilitiesTable} />
            </TabPanel>
            <TabPanel>
              <HatWearers hatData={hatData} chainId={chainId} />
            </TabPanel>
            <TabPanel>
              <Text>Events</Text>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Stack>
    </>
  );
};

export default Hat;
