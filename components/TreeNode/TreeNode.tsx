/* eslint-disable no-nested-ternary */
import {
  chakra,
  IconButton,
  Flex,
  Icon,
  Stack,
  Text,
  Heading,
  HStack,
  Box,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from '@chakra-ui/react';
import _ from 'lodash';
import { useEffect, useState } from 'react';
import { FaEllipsisV } from 'react-icons/fa';
import { useAccount, useChainId, useEnsName } from 'wagmi';

import useHatDetails from '@/hooks/useHatDetails';
import useHatDetailsField from '@/hooks/useHatDetailsField';
import { formatAddress } from '@/lib/general';
import { prettyIdToId, prettyIdToIp, isAdmin, isTopHat } from '@/lib/hats';

const HatHoverCard = ({
  name,
  attributes,
  hatData,
  hatDetails,
  handleAddChildClick,
  handleRequestLink,
  handleToggle,
  // handleLocalNodeClick,
  address,
  chainId,
  userChain,
  isWearer,
  isWearerOrAdminOfHat,
  wearerHats,
  isCurrentHat,
}: HatHoverCardProps) => {
  const wearer1 = _.get(_.first(_.get(hatData, 'wearers')), 'id');
  const wearer2 = _.get(_.nth(_.get(hatData, 'wearers'), 1), 'id');

  const { data: wearer1Name } = useEnsName({
    address: wearer1,
    chainId: 1,
  });
  const { data: wearer2Name } = useEnsName({
    address: wearer2,
    chainId: 1,
  });
  const { data: toggleName } = useEnsName({
    address: _.get(hatData, 'eligibility'),
    chainId: 1,
  });
  const { data: eligibilityName } = useEnsName({
    address: _.get(hatData, 'toggle'),
    chainId: 1,
  });

  let wearerString = _.join(
    _.compact([
      wearer1Name || formatAddress(wearer1),
      wearer2Name || formatAddress(wearer2),
    ]),
    ' & ',
  );
  if (_.gt(_.size(_.get(hatData, 'wearers')), 2)) {
    wearerString = `${_.join(
      _.compact([
        wearer1Name || formatAddress(wearer1),
        wearer2Name || formatAddress(wearer2),
      ]),
      ', ',
    )} & ${_.size(_.get(hatData, 'wearers')) - 2} other${
      _.size(_.get(hatData, 'wearers')) - 2 > 1 ? 's' : ''
    }`;
  }
  const toggleString = toggleName || formatAddress(_.get(hatData, 'toggle'));
  const eligibilityString =
    eligibilityName || formatAddress(_.get(hatData, 'eligibility'));

  return (
    <Flex
      gap={1}
      p={2}
      position='absolute'
      bg='white'
      w='225px'
      top='-2px'
      border='2px solid'
      borderColor={isCurrentHat ? '#437bc9' : '#6d858f'}
      borderRadius='md'
    >
      <Box w='100%' h='100%' position='relative'>
        <Box
          position='absolute'
          borderWidth={isWearer ? '2px' : '1px'}
          borderColor={
            isCurrentHat ? '#437bc9' : isWearer ? '#2EA043' : '#6d858f'
          }
          borderRadius='full'
          top='-50px'
          h='75px'
          w='75px'
          bgImage={
            attributes.imageURI
              ? `url('${attributes.imageURI}')`
              : "url('/icon.jpeg')"
          }
          bgSize='cover'
          bgPosition='center'
        >
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
        <Flex w='100%' justify='flex-end' minH='25px'>
          <Menu placement='bottom-end'>
            <MenuButton
              as={IconButton}
              icon={<Icon as={FaEllipsisV} />}
              aria-label='Options'
              variant='ghost'
              size='xs'
            />
            <MenuList>
              {address && chainId === userChain && isWearerOrAdminOfHat && (
                <MenuItem onClick={() => handleAddChildClick(name)}>
                  Add Child
                </MenuItem>
              )}
              {address && chainId === userChain && !_.isEmpty(wearerHats) && (
                <MenuItem onClick={() => handleRequestLink(name)}>
                  Link Top Hat
                </MenuItem>
              )}
              <MenuItem onClick={() => handleToggle()}>
                Expand/Collapse
              </MenuItem>
            </MenuList>
          </Menu>
        </Flex>
        <Stack mt={4} spacing={1}>
          <Heading
            size='sm'
            color={isCurrentHat ? '#437bc9' : isWearer ? '#2EA043' : '#6d858f'}
          >
            {prettyIdToIp(name)}{' '}
            {_.get(hatDetails, 'name') || _.get(hatData, 'details')}
          </Heading>
          {_.gt(_.size(_.get(hatData, 'wearers')), 0) && (
            <Text size='sm'>Worn by {wearerString}</Text>
          )}

          {!isTopHat(hatData) && (
            <>
              <HStack align='center'>
                <Text textTransform='uppercase' fontSize='xs'>
                  Eligibility
                </Text>
                <Text fontSize='sm'>{eligibilityString}</Text>
              </HStack>
              <HStack align='center'>
                <Text textTransform='uppercase' fontSize='xs'>
                  Toggle
                </Text>
                <Text fontSize='sm'>{toggleString}</Text>
              </HStack>
            </>
          )}
        </Stack>
      </Box>
    </Flex>
  );
};

interface HatHoverCardProps {
  name: string;
  attributes: any;
  hatData: any;
  hatDetails: any;
  handleAddChildClick: (name: string) => void;
  handleRequestLink: (name: string) => void;
  handleToggle: () => void;
  // handleLocalNodeClick?: () => void;
  address: `0x${string}` | undefined;
  chainId: number;
  userChain: number;
  isWearer: boolean;
  isWearerOrAdminOfHat: boolean;
  wearerHats: string[];
  isCurrentHat: boolean;
}

function Node({
  rd3tProps,
  handleNodeClick,
  handleAddChildClick,
  handleRequestLink,
  activeHatId,
  wearerHats,
  chainId,
}: NodeProps) {
  const [isHover, setIsHover] = useState(false);
  const userChain = useChainId();
  const { address } = useAccount();
  const { attributes, name } = rd3tProps.nodeDatum;
  const { treeId } = attributes;
  const { data: hatData } = useHatDetails({
    hatId: prettyIdToId(name) || '',
    chainId,
  });
  const { data: hatDetails } = useHatDetailsField(_.get(hatData, 'details'));

  const isCurrentHat = activeHatId === prettyIdToId(name);
  const isWearer = !_.isEmpty(_.filter(wearerHats, (val) => val === name));
  const isWearerOrAdminOfHat = isAdmin(name, wearerHats, true);

  const handleToggle = () => {
    rd3tProps.toggleNode();
  };

  useEffect(() => {
    if (isCurrentHat) {
      rd3tProps.onNodeClick();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLocalNodeClick = () => {
    handleNodeClick(name, treeId);
    rd3tProps.onNodeClick();
  };

  return (
    <g
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
    >
      <defs>
        <pattern
          id={name}
          x='0%'
          y='0%'
          height='100%'
          width='100%'
          viewBox='0 0 512 512'
        >
          <image
            x='0%'
            y='0%'
            width='512'
            height='512'
            style={{ opacity: !_.get(hatData, 'status') ? 0.6 : 1 }}
            href={attributes.imageURI}
            preserveAspectRatio='xMidYMid slice'
          />
        </pattern>
      </defs>
      <circle
        r={isCurrentHat ? 30 : 25}
        fill={attributes.imageURI !== undefined ? `url(#${name})` : 'grey'}
        fillRule='evenodd'
        style={{
          stroke: isCurrentHat ? '#437bc9' : '#6d858f',
          strokeWidth: isCurrentHat ? '4px' : '2px',
          strokeOpacity: '50%',
          // opacity: !_.get(hatData, 'status') ? 0.6 : 1,
        }}
        onClick={handleLocalNodeClick}
      />
      <foreignObject width={230} height={200} x={35} y={-25} overflow='visible'>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Stack position='relative' spacing={1} zIndex={0}>
            <Heading size='sm' noOfLines={2}>
              {prettyIdToIp(name)}{' '}
              {_.get(hatDetails, 'name') || _.get(hatData, 'details')}
            </Heading>
            <HStack>
              <Text fontSize='xs'>
                {_.size(_.get(hatData, 'wearers'))}/
                {_.get(hatData, 'maxSupply')} Wearer
                {_.gt(_.get(hatData, 'maxSupply'), 1) ? 's' : ''}
              </Text>
              {isWearer && (
                <chakra.div bg='green.400' borderRadius='md' p={1} />
              )}
            </HStack>
            {isHover && (
              <HatHoverCard
                name={name}
                attributes={attributes}
                hatData={hatData}
                hatDetails={hatDetails}
                handleAddChildClick={handleAddChildClick}
                handleRequestLink={handleRequestLink}
                handleToggle={handleToggle}
                address={address}
                chainId={chainId}
                userChain={userChain}
                isWearer={isWearer}
                isWearerOrAdminOfHat={isWearerOrAdminOfHat}
                wearerHats={wearerHats}
                // handleLocalNodeClick={handleLocalNodeClick}
                isCurrentHat={isCurrentHat}
              />
            )}
          </Stack>
        </div>
      </foreignObject>
      ,
    </g>
  );
}

interface NodeProps {
  rd3tProps: any;
  handleNodeClick: (name: string, treeId: string) => void;
  handleAddChildClick: (name: string) => void;
  handleRequestLink: (name: string) => void;
  activeHatId: string;
  wearerHats: string[];
  chainId: number;
}

export default function TreeNode({
  rd3tProps,
  handleNodeClick,
  handleAddChildClick,
  handleRequestLink,
  activeHatId,
  wearerHats,
  chainId,
}: TreeNodeProps) {
  return (
    <Node
      rd3tProps={rd3tProps}
      handleNodeClick={handleNodeClick}
      handleAddChildClick={handleAddChildClick}
      handleRequestLink={handleRequestLink}
      activeHatId={activeHatId}
      wearerHats={wearerHats}
      chainId={chainId}
    />
  );
}

interface TreeNodeProps {
  rd3tProps: any;
  handleNodeClick: (name: string, treeId: string) => void;
  handleAddChildClick: (name: string) => void;
  handleRequestLink: (name: string) => void;
  activeHatId: string;
  wearerHats: string[];
  chainId: number;
}
