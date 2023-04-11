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
  Button,
  Box,
} from '@chakra-ui/react';
import { useState } from 'react';
import _ from 'lodash';
import { formatDistanceToNow } from 'date-fns';
import { FaPencilAlt } from 'react-icons/fa';
import { useAccount, useChainId } from 'wagmi';

import HatWearers from './HatWearers';
import AddressLink from '../AddressLink';
import DataTable from '../DataTable';
import { ZERO_ADDRESS, MODULE_TYPES, hatsAddresses } from '../../constants';
import Modal from '../Modal';
import HatModulesForm from '../../forms/HatModulesForm';
import { useOverlay } from '../../contexts/OverlayContext';
import EventsTable from '../EventsTable';
import {
  decimalId,
  prettyIdToIp,
  topHatOrMutable,
  isAdmin,
  mutableNotTopHat,
} from '../../lib/hats';
import CopyToClipboard from '../CopyToClipboard';
import { clearNonObjects } from '../../lib/general';
import HatDetailsForm from '../../forms/HatDetailsForm';
import useWearerDetails from '../../hooks/useWearerDetails';
import useHatMakeImmutable from '../../hooks/useHatMakeImmutable';
import HatImageForm from '../../forms/HatImageForm';
import HatSupplyForm from '../../forms/HatSupplyForm';

const defaultChainId = 5;
const hatsAddress = hatsAddresses(defaultChainId);

const AddressRow = ({
  address,
  mutable,
  admin,
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
      {userAddress && mutable && admin && (
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

const Hat = ({ hatData, chainId, treeId, hatImage }) => {
  const localOverlay = useOverlay();
  const { setModals } = localOverlay;
  const { address } = useAccount();
  const userChain = useChainId();
  const { data: wearer } = useWearerDetails({
    wearerAddress: address,
    chainId,
  });
  const { writeAsync } = useHatMakeImmutable({ hatsAddress, chainId, hatData });
  const currentWearerHats = _.map(_.get(wearer, 'currentHats'), 'prettyId');
  const [type, setType] = useState(MODULE_TYPES.eligibility);
  const [imageHover, setImageHover] = useState(false);
  if (!hatData) return null;

  const handleOpenDetailsModal = () => {
    setModals({ hatDetails: true });
  };

  const handleOpenImageModal = () => {
    setModals({ hatImage: true });
  };

  const handleOpenSupplyModal = () => {
    setModals({ hatSupply: true });
  };

  const handleMakeImmutable = () => {
    writeAsync?.();
  };

  const accountabilitiesTable = [
    _.gt(_.get(hatData, 'levelAtLocalTree'), 0) && {
      label: 'Admin ID',
      value: (
        <CopyToClipboard
          copyValue={decimalId(_.get(hatData, 'admin.id', '0'))}
          description='Admin ID'
        >{`${prettyIdToIp(
          _.get(hatData, 'admin.prettyId', '0'),
        )}`}</CopyToClipboard>
      ),
    },
    // _.gt(_.get(hatData, 'levelAtLocalTree'), 0) && {
    //   label: 'Pretty Admin ID',
    //   value: (
    //     <CopyToClipboard>{_.get(hatData, 'admin.prettyId')}</CopyToClipboard>
    //   ),
    // },
    {
      label: 'Eligibility',
      value: (
        <AddressRow
          address={hatData.eligibility}
          chainId={chainId}
          type={MODULE_TYPES.eligibility}
          mutable={mutableNotTopHat(hatData)}
          admin={
            isAdmin(_.get(hatData, 'prettyId'), currentWearerHats) &&
            chainId === userChain
          }
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
          mutable={mutableNotTopHat(hatData)}
          admin={
            isAdmin(_.get(hatData, 'prettyId'), currentWearerHats) &&
            chainId === userChain
          }
          setType={setType}
          localOverlay={localOverlay}
        />
      ),
    },
  ];
  const canEditImage =
    userChain === chainId &&
    address &&
    topHatOrMutable(hatData) &&
    isAdmin(_.get(hatData, 'id'), currentWearerHats);

  return (
    <>
      <Modal name='editModule' title='Edit Module' localOverlay={localOverlay}>
        <HatModulesForm type={type} hatData={hatData} chainId={chainId} />
      </Modal>
      <Modal
        name='hatDetails'
        title='Edit Hat Details'
        localOverlay={localOverlay}
      >
        <HatDetailsForm hatData={hatData} chainId={chainId} />
      </Modal>
      <Modal name='hatImage' title='Edit Hat Image' localOverlay={localOverlay}>
        <HatImageForm hatData={hatData} chainId={chainId} />
      </Modal>
      <Modal
        name='hatSupply'
        title='Edit Max Supply'
        localOverlay={localOverlay}
      >
        <HatSupplyForm hatData={hatData} chainId={chainId} />
      </Modal>

      <Stack>
        <Flex justify='space-between'>
          <HStack spacing={4}>
            <Box
              transform={imageHover && canEditImage && 'scale(1.05)'}
              cursor={imageHover && canEditImage && 'pointer'}
              onMouseEnter={() => canEditImage && setImageHover(true)}
              onMouseLeave={() => setImageHover(false)}
              position='relative'
              border='1px solid'
              borderColor='gray.200'
              w='75px'
              h='75px'
              onClick={canEditImage ? handleOpenImageModal : undefined}
              bgImage={hatImage ?? '/icon.jpeg'}
              bgSize='cover'
            >
              {imageHover && (
                <Icon
                  as={FaPencilAlt}
                  position='absolute'
                  color='whiteAlpha.700'
                  w='40px'
                  h='40px'
                  top='22%'
                  left='22%'
                />
              )}
            </Box>

            <Stack spacing={1}>
              {/* TODO add name if found in details object */}
              <HStack>
                <Text fontSize='sm' fontWeight={700}>
                  Hat ID
                </Text>
                <CopyToClipboard
                  copyValue={decimalId(_.get(hatData, 'id'))}
                  description='Hat ID'
                >
                  {prettyIdToIp(_.get(hatData, 'prettyId'))}
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
          <Stack textAlign='center' spacing={1} justify='center'>
            <Badge colorScheme={hatData.status ? 'green' : 'blue'}>
              {hatData.status ? 'Active' : 'Inactive'}
            </Badge>

            {hatData?.levelAtLocalTree === 0 ? (
              <Badge colorScheme='purple'>Top Hat</Badge>
            ) : (
              <>
                <Badge colorScheme={hatData.mutable ? 'green' : 'blue'}>
                  {hatData.mutable ? 'Mutable' : 'Immutable'}
                </Badge>
                <Badge colorScheme='purple'>
                  Level {hatData?.levelAtLocalTree}
                </Badge>
              </>
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
            {address &&
              userChain === chainId &&
              isAdmin(_.get(hatData, 'prettyId'), currentWearerHats) &&
              mutableNotTopHat(hatData) && <Tab>Admin</Tab>}
          </TabList>
          <TabPanels>
            {/* Details, where is this coming back from? IPFS hash? */}
            <TabPanel>
              <Box>
                {canEditImage && (
                  <IconButton
                    icon={<Icon as={FaPencilAlt} h='12px' w='12px' />}
                    minW='auto'
                    w={8}
                    h={8}
                    variant='outline'
                    float='right'
                    onClick={canEditImage ? handleOpenDetailsModal : undefined}
                  />
                )}

                <Text>{hatData?.details}</Text>
              </Box>
            </TabPanel>
            {/* TODO Authorities will be designated in details for now, hard-ish to track */}
            {/* <TabPanel /> */}
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
            {userChain === chainId &&
              isAdmin(_.get(hatData, 'prettyId'), currentWearerHats) &&
              mutableNotTopHat(hatData) && (
                <TabPanel>
                  <HStack>
                    <Button variant='outline' onClick={handleOpenSupplyModal}>
                      Adjust Max Supply
                    </Button>
                    <Button variant='outline' onClick={handleMakeImmutable}>
                      Make Immutable
                    </Button>
                  </HStack>
                </TabPanel>
              )}
          </TabPanels>
        </Tabs>
      </Stack>
    </>
  );
};

export default Hat;
