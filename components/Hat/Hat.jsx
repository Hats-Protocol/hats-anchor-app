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
import { useAccount } from 'wagmi';

import HatWearers from './HatWearers';
import AddressLink from '../AddressLink';
import DataTable from '../DataTable';
import { ZERO_ADDRESS, MODULE_TYPES } from '../../constants';
import Modal from '../Modal';
import HatModulesForm from '../../forms/HatModulesForm';
import { useOverlay } from '../../contexts/OverlayContext';
import EventsTable from '../EventsTable';
import { decimalId } from '../../lib/hats';
import CopyToClipboard from '../CopyToClipboard';
import { clearNonObjects } from '../../lib/general';

const AddressRow = ({
  address,
  mutable,
  chainId,
  type,
  setType,
  localOverlay,
}) => {
  const { address: userAddress } = useAccount();
  const { setModals } = localOverlay;

  const openModal = () => {
    setType(type);
    setModals({ editModule: true });
  };

  return (
    <HStack spacing={2}>
      {address !== ZERO_ADDRESS ? (
        <AddressLink address={address} chainId={chainId} />
      ) : (
        <Text>None Set</Text>
      )}
      {userAddress && mutable && (
        <IconButton
          icon={<Icon as={FaPencilAlt} h='12px' w='12px' />}
          minW='auto'
          w={8}
          h={8}
          variant='ghost'
          onClick={openModal}
        />
      )}
    </HStack>
  );
};
// TODO this should probably be more components

const Hat = ({ hatData, chainId, treeId }) => {
  const localOverlay = useOverlay();
  const [type, setType] = useState(MODULE_TYPES.eligibility);
  if (!hatData) return null;

  const accountabilitiesTable = [
    _.gt(_.get(hatData, 'levelAtLocalTree'), 0) && {
      label: 'Admin ID',
      value: (
        <CopyToClipboard
          copyValue={decimalId(_.get(hatData, 'admin.id', '0'))}
          description='Admin ID'
        >{`${decimalId(_.get(hatData, 'admin.id', '0')).slice(
          0,
          10,
        )}...`}</CopyToClipboard>
      ),
    },
    _.gt(_.get(hatData, 'levelAtLocalTree'), 0) && {
      label: 'Pretty Admin ID',
      value: (
        <CopyToClipboard>{_.get(hatData, 'admin.prettyId')}</CopyToClipboard>
      ),
    },
    {
      label: 'Eligibility',
      value: (
        <AddressRow
          address={hatData.eligibility}
          chainId={chainId}
          type={MODULE_TYPES.eligibility}
          mutable={_.get(hatData, 'mutable')}
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
          type={MODULE_TYPES.toggle}
          mutable={_.get(hatData, 'mutable')}
          setType={setType}
          localOverlay={localOverlay}
        />
      ),
    },
  ];

  return (
    <>
      <Modal name='editModule' title='Edit Module' localOverlay={localOverlay}>
        <HatModulesForm type={type} />
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
              <HStack>
                <Text fontSize='sm' fontWeight={700}>
                  Hat ID
                </Text>
                <CopyToClipboard description='Hat ID'>
                  {_.get(hatData, 'prettyId')}
                </CopyToClipboard>
              </HStack>
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
            <TabPanel>
              <Stack>
                <Flex justify='flex-end'>
                  <IconButton
                    icon={<Icon as={FaPencilAlt} h='12px' w='12px' />}
                    minW='auto'
                    w={8}
                    h={8}
                    variant='outline'
                  />
                </Flex>
                <Text>{hatData?.details}</Text>
              </Stack>
            </TabPanel>
            {/* TODO Authorities will be designated in details for now, hard-ish to track */}
            {/* <TabPanel /> */}
            {/* TODO Accountabilities are found .... */}
            <TabPanel>
              <DataTable
                data={clearNonObjects(accountabilitiesTable)}
                justify='space-between'
                minH={10}
              />
            </TabPanel>
            <TabPanel>
              <HatWearers hatData={hatData} chainId={chainId} />
            </TabPanel>
            <TabPanel>
              <EventsTable
                treeId={treeId}
                events={hatData?.events}
                chainId={chainId}
              />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Stack>
    </>
  );
};

export default Hat;
