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
  Badge,
  Icon,
  IconButton,
  Button,
  Box,
} from '@chakra-ui/react';
import { useState } from 'react';
import _ from 'lodash';
import { formatDistanceToNow } from 'date-fns';
import { FaPencilAlt, FaExternalLinkAlt } from 'react-icons/fa';
import { useAccount, useChainId } from 'wagmi';

import HatWearers from './HatWearers';
import AddressRow from './AddressRow';
import Link from '../ChakraNextLink';
import DataTable from '../DataTable';
import { MODULE_TYPES, hatsAddresses } from '../../constants';
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
  prettyIdToUrlId,
  getTreeId,
} from '../../lib/hats';
import CopyToClipboard from '../CopyToClipboard';
import { clearNonObjects } from '../../lib/general';
import HatDetailsForm from '../../forms/HatDetailsForm';
import useWearerDetails from '../../hooks/useWearerDetails';
import useHatMakeImmutable from '../../hooks/useHatMakeImmutable';
import HatImageForm from '../../forms/HatImageForm';
import HatSupplyForm from '../../forms/HatSupplyForm';
import useHatDetailsField from '../../hooks/useHatDetailsField';
import HatStatusForm from '../../forms/HatStatusForm';
import HatWearerStatusForm from '../../forms/HatWearerStatusForm';
import useHatStatusCheck from '../../hooks/useHatStatusCheck';
import LinkRequestApprove from '../../forms/LinkRequestApproveForm';
import HatUnlinkForm from '../../forms/HatUnlinkForm';

const defaultChainId = 5;
const hatsAddress = hatsAddresses(defaultChainId);

// TODO this should probably be more components

const Hat = ({
  hatData,
  chainId,
  treeId,
  hatImage,
  childrenHats,
  linkRequestFromTree,
}) => {
  const localOverlay = useOverlay();
  const { setModals } = localOverlay;
  const { address } = useAccount();
  const userChain = useChainId();
  const { data: wearer } = useWearerDetails({
    wearerAddress: address,
    chainId,
  });
  const { writeAsync: updateImmutability } = useHatMakeImmutable({
    hatsAddress,
    chainId,
    hatData,
  });
  const { writeAsync: checkHatStatus } = useHatStatusCheck({
    hatsAddress,
    chainId,
    hatData,
  });
  const currentWearerHats = _.map(_.get(wearer, 'currentHats'), 'prettyId');
  const [type, setType] = useState(MODULE_TYPES.eligibility);
  const [imageHover, setImageHover] = useState(false);
  const [topHatDomain, setTopHatDomain] = useState('');
  const {
    data: hatDetailsFieldData,
    isLoading: hatDetailsFieldLoading,
    // error: hatDetailsFieldError,
    schemaType: schemaTypeDetailsField,
  } = useHatDetailsField(hatData?.details);

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
    updateImmutability?.();
  };

  const handleOpenLinkRequestApproveModal = (id) => {
    setTopHatDomain(id);
    setModals({ linkResponse: true });
  };

  const isAdminUser =
    userChain === chainId &&
    isAdmin(_.get(hatData, 'prettyId'), currentWearerHats);

  const showSupplyAndImmutableButtons =
    isAdminUser && mutableNotTopHat(hatData);

  const canEditImage = isAdminUser && address && topHatOrMutable(hatData);

  const authoritiesTable = _.map(childrenHats, (hat) => ({
    key: _.get(hat, 'prettyId'),
    label: (
      <Text as='span'>
        Admin of hat #{prettyIdToIp(_.get(hat, 'prettyId'))}
      </Text>
    ),
    value: (
      <Link
        href={`/trees/${chainId}/${decimalId(
          getTreeId(_.get(hat, 'prettyId')),
        )}/${prettyIdToUrlId(_.get(hat, 'prettyId'))}`}
      >
        <HStack>
          <Text>Hats Protocol</Text>
          <Icon as={FaExternalLinkAlt} h='15px' w='15px' />
        </HStack>
      </Link>
    ),
  }));

  const accountabilitiesTable = [
    _.gt(_.get(hatData, 'levelAtLocalTree'), 0) && {
      label: 'Admin ID',
      value: (
        <CopyToClipboard
          copyValue={_.get(hatData, 'admin.prettyId', '0')}
          description='Admin ID'
        >{`${prettyIdToIp(
          _.get(hatData, 'admin.prettyId', '0'),
        )}`}</CopyToClipboard>
      ),
    },
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
          user={address}
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
          user={address}
          checkHatStatus={checkHatStatus}
        />
      ),
    },
  ];

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
      <Modal
        name='hatWearerStatus'
        title='Change Wearer Status'
        localOverlay={localOverlay}
      >
        <HatWearerStatusForm
          hatData={hatData}
          chainId={chainId}
          defaultValues={{
            wearer: '',
            eligibility: 'Eligible',
            standing: 'Good Standing',
          }}
        />
      </Modal>
      <Modal
        name='hatStatus'
        title='Change Hat Status'
        localOverlay={localOverlay}
      >
        <HatStatusForm hatData={hatData} chainId={chainId} />
      </Modal>
      <Modal
        name='linkResponse'
        title='Approve Link Request'
        localOverlay={localOverlay}
      >
        <LinkRequestApprove
          topHatDomain={topHatDomain}
          hatData={hatData}
          chainId={chainId}
        />
      </Modal>
      <Modal
        name='unlinkTree'
        title='Unlink Top Hat From Tree'
        localOverlay={localOverlay}
      >
        <HatUnlinkForm hatData={hatData} chainId={chainId} />
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
              bgImage={`url('${hatImage}'), url('/icon.jpeg')`}
              bgSize='cover'
              bgPosition='center'
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
            <Tab px={2} fontSize='sm'>
              Details
            </Tab>
            {!_.isEmpty(clearNonObjects(authoritiesTable)) && (
              <Tab px={2} fontSize='sm'>
                Authorities
              </Tab>
            )}
            <Tab px={2} fontSize='sm'>
              Accountabilities
            </Tab>
            <Tab px={2} fontSize='sm'>
              Wearers
            </Tab>
            <Tab px={2} fontSize='sm'>
              Events
            </Tab>
            {address &&
              userChain === chainId &&
              isAdmin(_.get(hatData, 'prettyId'), currentWearerHats) &&
              (mutableNotTopHat(hatData) ||
                linkRequestFromTree?.length > 0) && (
                <Tab fontSize='sm'>Admin</Tab>
              )}
          </TabList>
          <TabPanels>
            {/* Details, where is this coming back from? IPFS hash? */}
            <TabPanel minH='370px'>
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

                {schemaTypeDetailsField === '1.0' &&
                  (hatDetailsFieldLoading ? (
                    'Loading...'
                  ) : (
                    <>
                      <Text fontSize='sm' as='b'>
                        Name:
                      </Text>
                      <Text>{hatDetailsFieldData.data.data.name}</Text>
                      <Text fontSize='sm' as='b'>
                        Description:
                      </Text>
                      <Text>{hatDetailsFieldData.data.data.description}</Text>
                    </>
                  ))}
                {schemaTypeDetailsField !== '1.0' && (
                  <Text>{hatData?.details}</Text>
                )}
              </Box>
            </TabPanel>
            {/* TODO Authorities will be designated in details for now, hard-ish to track */}
            {!_.isEmpty(clearNonObjects(authoritiesTable)) && (
              <TabPanel minH='370px'>
                <DataTable
                  data={clearNonObjects(authoritiesTable)}
                  justify='space-between'
                  minH={10}
                  labelWidth='40%'
                />
              </TabPanel>
            )}

            <TabPanel minH='370px'>
              <DataTable
                data={clearNonObjects(accountabilitiesTable)}
                justify='space-between'
                minH={10}
              />
            </TabPanel>
            <TabPanel minH='370px'>
              <HatWearers hatData={hatData} chainId={chainId} />
            </TabPanel>
            <TabPanel minH='370px'>
              <EventsTable
                treeId={treeId}
                events={hatData?.events}
                chainId={chainId}
              />
            </TabPanel>
            {isAdminUser &&
            (showSupplyAndImmutableButtons ||
              linkRequestFromTree?.length > 0) ? (
              <TabPanel minH='370px'>
                <HStack
                  justifyContent='space-between'
                  flexWrap='wrap'
                  spacing={1}
                  gap={1}
                >
                  {showSupplyAndImmutableButtons && (
                    <>
                      <Button variant='outline' onClick={handleOpenSupplyModal}>
                        Adjust Max Supply
                      </Button>
                      <Button variant='outline' onClick={handleMakeImmutable}>
                        Make Immutable
                      </Button>
                    </>
                  )}
                  {linkRequestFromTree?.map((linkRequest) => (
                    <Button
                      variant='outline'
                      onClick={() =>
                        handleOpenLinkRequestApproveModal(linkRequest.id)
                      }
                      key={linkRequest.id}
                    >
                      Link Request to {linkRequest.id}
                    </Button>
                  ))}
                  <Button
                    variant='outline'
                    onClick={() => setModals({ unlinkTree: true })}
                  >
                    Unlink Tree
                  </Button>
                </HStack>
              </TabPanel>
            ) : null}
          </TabPanels>
        </Tabs>
      </Stack>
    </>
  );
};

export default Hat;
