import {
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Button,
  HStack,
  Icon,
  IconButton,
  Image,
  Text,
  Tooltip,
} from '@chakra-ui/react';
import {
  AUTHORITY_ENFORCEMENT,
  AUTHORITY_TYPES,
} from '@hatsprotocol/constants';
import { hatIdDecimalToIp } from '@hatsprotocol/sdk-v1-core';
import { Authority, AuthorityType } from 'hats-types';
import _ from 'lodash';
import { BsInfoCircle } from 'react-icons/bs';
import { FaExternalLinkAlt } from 'react-icons/fa';
import { getHostnameFromURL, validateURL } from 'utils';

import { ChakraNextLink, Markdown } from '../atoms';
import AuthorityHeader from './AuthorityHeader';
import ModuleAuthorityToolbar from './ModuleAuthorityToolbar';

const AuthoritiesListCard = ({
  authority,
  type,
  index,
}: {
  authority?: Authority;
  type: AuthorityType;
  index: number;
}) => {
  const { label, description, link, gate, strategies, hatId } = _.pick(
    authority,
    ['label', 'description', 'link', 'gate', 'strategies', 'hatId'],
  );
  const gateHostName = getHostnameFromURL(gate);
  const linkHostName = getHostnameFromURL(link);

  const discordHosts = ['discord.gg', 'discord.com'];
  let linkName = '';
  if (_.includes(discordHosts, linkHostName)) {
    linkName = 'Go to Discord';
  } else if (linkHostName === 'docs.google.com') {
    linkName = 'Open Doc';
  } else if (linkHostName === 'github.com') {
    linkName = 'Go to Repo';
  } else if (linkHostName === 'snapshot.org') {
    linkName = 'Go to Space';
  }

  const displayModulesToolbar =
    type === AUTHORITY_TYPES.modules ||
    type === AUTHORITY_TYPES.hsg ||
    type === AUTHORITY_TYPES.wallet;

  const authorityEnforcement = type
    ? AUTHORITY_ENFORCEMENT[type]
    : AUTHORITY_ENFORCEMENT.manual;

  // set tooltip info
  let tooltipInfo = authorityEnforcement.info;
  if (strategies) {
    tooltipInfo = `Automatically pulled in from Snapshot. Voting weight in ${_.size(
      strategies,
    )} ${_.size(strategies) === 1 ? 'strategy.' : 'strategies.'}`;
  }
  if (type === AUTHORITY_TYPES.modules && hatId) {
    tooltipInfo = `Connected onchain via the ${label} module for Hat #${hatIdDecimalToIp(
      BigInt(hatId),
    )}`;
  }

  if (!gate && !description) return <AuthorityHeader authority={authority} />;

  return (
    <AccordionItem border='none' w='calc(100% + 32px)' ml={-4}>
      {({ isExpanded }) => (
        <>
          <AccordionButton
            borderBottom='1px solid'
            borderColor='transparent'
            _hover={{ borderColor: 'blue.300', bg: 'white' }}
            borderRadius={8}
          >
            <AuthorityHeader authority={authority} isExpanded={isExpanded} />
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel px={4}>
            <Tooltip
              label={tooltipInfo}
              placement='right'
              hasArrow
              shouldWrapChildren
            >
              <HStack pb={2}>
                {/* <Circle size='10px' bg={authorityEnforcement.color} /> */}
                <Image src={authorityEnforcement.icon} alt='Hat' w={5} />
                <Text size='sm'>{authorityEnforcement.label}</Text>
                <Icon as={BsInfoCircle} boxSize='12px' cursor='pointer' />
              </HStack>
            </Tooltip>

            {displayModulesToolbar ? (
              <ModuleAuthorityToolbar authority={authority} index={index} />
            ) : (
              <HStack>
                {link && validateURL(link) && (
                  <ChakraNextLink isExternal href={link} display='block'>
                    {linkName || linkHostName ? (
                      <Button
                        rightIcon={<Icon as={FaExternalLinkAlt} />}
                        colorScheme='blue'
                        size='sm'
                        variant='solid'
                      >
                        {linkName || linkHostName}
                      </Button>
                    ) : (
                      <IconButton
                        icon={<Icon as={FaExternalLinkAlt} />}
                        colorScheme='blue'
                        aria-label='Authority Link'
                        size='sm'
                        variant='solid'
                      />
                    )}
                  </ChakraNextLink>
                )}
                {gate && validateURL(gate) && (
                  <ChakraNextLink isExternal href={gate} display='block'>
                    <Button
                      rightIcon={<Icon as={FaExternalLinkAlt} />}
                      color='blue.500'
                      borderColor='blue.500'
                      variant='outlineMatch'
                      size='sm'
                    >
                      {gateHostName}
                    </Button>
                  </ChakraNextLink>
                )}
              </HStack>
            )}
            {description && (
              <Box pt={link || gate ? 2 : 0}>
                <Text size='sm' variant='medium'>
                  Details
                </Text>
                <Markdown smallFont>{description}</Markdown>
              </Box>
            )}
          </AccordionPanel>
        </>
      )}
    </AccordionItem>
  );
};

export default AuthoritiesListCard;
