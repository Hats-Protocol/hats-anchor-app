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
  Box,
  Code,
} from '@chakra-ui/react';
import { useState } from 'react';
import _ from 'lodash';
import { formatDistanceToNow } from 'date-fns';
import { FaPencilAlt, FaExternalLinkAlt } from 'react-icons/fa';
import { useAccount, useChainId } from 'wagmi';

import CONFIG, { MODULE_TYPES } from '@/constants';
import HatModulesForm from '@/forms/HatModulesForm';
import { useOverlay } from '@/contexts/OverlayContext';
import {
  decimalId,
  prettyIdToIp,
  isTopHatOrMutable,
  isAdmin,
  isMutableNotTopHat,
  prettyIdToUrlId,
  getTreeId,
  isTopHat,
} from '@/lib/hats';
import { clearNonObjects } from '@/lib/general';
import HatDetailsForm from '@/forms/HatDetailsForm';
import useWearerDetails from '@/hooks/useWearerDetails';
import HatImageForm from '@/forms/HatImageForm';

import HatStatusForm from '@/forms/HatStatusForm';
import HatWearerStatusForm from '@/forms/HatWearerStatusForm';
import useHatStatusCheck from '@/hooks/useHatStatusCheck';
import CopyToClipboard from '@/components/CopyToClipboard';
import ChakraNextLink from '@/components/ChakraNextLink';
import DataTable from '@/components/DataTable';
import Modal from '@/components/Modal';
import EventsTable from '@/components/EventsTable';
import useHatGuilds from '@/hooks/useGuilds';

import AdminActions from './AdminActions';
import HatWearers from './HatWearers';
import AddressRow from './AddressRow';

// TODO this should probably be more components

const Hat = ({
  hatData,
  chainId,
  treeId,
  linkedToHat,
  hatImage,
  childrenHats,
  linkRequestFromTree,
  parentOfTrees,
  topHatDetails,
}) => {
  const localOverlay = useOverlay();
  const { setModals } = localOverlay;
  const { address } = useAccount();
  const userChain = useChainId();
  const { data: wearer } = useWearerDetails({
    wearerAddress: address,
    chainId,
  });
  const { writeAsync: checkHatStatus, isLoading } = useHatStatusCheck({
    hatsAddress: CONFIG.hatsAddress,
    chainId,
    hatData,
  });
  const currentWearerHats = _.map(_.get(wearer, 'currentHats'), 'prettyId');
  const isWearer = _.includes(currentWearerHats, _.get(hatData, 'prettyId'));

  const [type, setType] = useState(MODULE_TYPES.eligibility);
  const [imageHover, setImageHover] = useState(false);

  const { hatRoles } = useHatGuilds({
    guildNames: _.get(topHatDetails?.data, 'guilds'),
    hatId: _.get(hatData, 'id'),
  });

  if (!hatData) return null;

  const handleOpenDetailsModal = () => {
    setModals({ hatDetails: true });
  };

  const handleOpenImageModal = () => {
    setModals({ hatImage: true });
  };

  const isAdminUser =
    userChain === chainId &&
    (isAdmin(_.get(hatData, 'prettyId'), currentWearerHats) ||
      isAdmin(linkedToHat?.tree?.id, currentWearerHats));

  const canEditImage = isAdminUser && address && isTopHatOrMutable(hatData);

  const childrenHatsIds = _.map(childrenHats, 'prettyId') || [];
  const parentOfTreesIds = _.map(parentOfTrees, 'id') || [];

  const authoritiesTable = [
    ..._.map(childrenHatsIds.concat(parentOfTreesIds), (hatId) => ({
      key: hatId,
      label: <Text as='span'>Admin of hat #{prettyIdToIp(hatId)}</Text>,
      value: (
        <ChakraNextLink
          href={`/trees/${chainId}/${decimalId(
            getTreeId(hatId),
          )}/${prettyIdToUrlId(hatId)}`}
        >
          <HStack>
            <Text>Hats Protocol</Text>
            <Icon as={FaExternalLinkAlt} h='15px' w='15px' />
          </HStack>
        </ChakraNextLink>
      ),
    })),
    ...(hatRoles && hatRoles.length > 0
      ? _.map(hatRoles, ({ role, guild }) => ({
          key: role,
          label: <Text as='span'>{role}</Text>,
          value: (
            <ChakraNextLink href={`https://guild.xyz/${guild}`} isExternal>
              <HStack>
                <Text>Guild.xyz</Text>
                <Icon as={FaExternalLinkAlt} h='15px' w='15px' />
              </HStack>
            </ChakraNextLink>
          ),
        }))
      : []),
  ];

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
          isTopHat={isTopHat(hatData)}
          chainId={chainId}
          type={MODULE_TYPES.eligibility}
          mutable={isMutableNotTopHat(hatData)}
          admin={isAdminUser}
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
          isTopHat={isTopHat(hatData)}
          chainId={chainId}
          type={MODULE_TYPES.toggle}
          mutable={isMutableNotTopHat(hatData)}
          admin={isAdminUser}
          setType={setType}
          localOverlay={localOverlay}
          user={address}
          checkHatStatus={checkHatStatus}
          isLoading={isLoading}
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
        <HatDetailsForm
          hatData={hatData}
          hatDetails={
            hatData.detailsResolved?.type === '1.0'
              ? hatData.detailsResolved?.data
              : {}
          }
          chainId={chainId}
        />
      </Modal>
      <Modal name='hatImage' title='Edit Hat Image' localOverlay={localOverlay}>
        <HatImageForm hatData={hatData} chainId={chainId} />
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

      <Stack>
        <Flex justify='space-between'>
          <HStack spacing={4}>
            <Box
              transform={imageHover && canEditImage && 'scale(1.05)'}
              cursor={imageHover && canEditImage && 'pointer'}
              onMouseEnter={() => canEditImage && setImageHover(true)}
              onMouseLeave={() => setImageHover(false)}
              position='relative'
              borderWidth={isWearer ? '2px' : '1px'}
              borderColor={isWearer ? '#2EA043' : '#CBD5E0'}
              w='75px'
              h='75px'
              onClick={canEditImage ? handleOpenImageModal : undefined}
              bgImage={hatImage ? `url('${hatImage}')` : "url('/icon.jpeg')"}
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
              {isWearer && (
                <Flex
                  position='absolute'
                  bottom='-10px'
                  left='50%'
                  transform='translateX(-50%)'
                  w='full'
                  h='14px'
                  color='white'
                  fontSize='8px'
                  fontWeight={700}
                  alignItems='center'
                  justifyContent='center'
                  px={3}
                >
                  <Text bg='#2EA043' px={2} lineHeight='14px'>
                    WEARER
                  </Text>
                </Flex>
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
            {isAdminUser && <Tab fontSize='sm'>Admin</Tab>}
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

                {hatData.detailsResolved?.type === '1.0' && (
                  <Stack>
                    <HStack>
                      <Text fontSize='sm' as='b'>
                        Name:
                      </Text>
                      <Text>
                        {_.get(hatData.detailsResolved?.data, 'name')}
                      </Text>
                    </HStack>
                    <HStack>
                      <Text fontSize='sm' as='b'>
                        Description:
                      </Text>
                      <Text>
                        {_.get(hatData.detailsResolved?.data, 'description')}
                      </Text>
                    </HStack>
                    {_.get(topHatDetails?.data, 'guilds') &&
                      topHatDetails?.type === '1.0' && (
                        <HStack>
                          <Text fontSize='sm' as='b'>
                            Guilds:
                          </Text>

                          {_.map(
                            _.get(topHatDetails?.data, 'guilds'),
                            (guild) => (
                              <Code key={guild}>{guild}</Code>
                            ),
                          )}
                        </HStack>
                      )}
                  </Stack>
                )}
                {hatData.detailsResolved?.type !== '1.0' && (
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
              <HatWearers
                hatData={hatData}
                parentOfTrees={parentOfTrees}
                chainId={chainId}
                isAdminUser={isAdminUser}
              />
            </TabPanel>
            <TabPanel minH='370px'>
              <EventsTable
                chainId={chainId}
                treeId={treeId}
                events={hatData?.events}
              />
            </TabPanel>
            {isAdminUser && (
              <TabPanel minH='370px'>
                <AdminActions
                  hatData={hatData}
                  chainId={chainId}
                  linkRequestFromTree={linkRequestFromTree}
                  hatsAddress={CONFIG.hatsAddress}
                  linkedToHat={linkedToHat}
                  parentOfTrees={_.map(parentOfTrees, 'id')}
                />
              </TabPanel>
            )}
          </TabPanels>
        </Tabs>
      </Stack>
    </>
  );
};

export default Hat;
