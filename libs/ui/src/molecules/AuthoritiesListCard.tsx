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
  Text,
} from '@chakra-ui/react';
import { AUTHORITY_TYPES } from '@hatsprotocol/constants';
import { Authority, AuthorityType } from 'hats-types';
import _ from 'lodash';
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
  const { description, link, gate } = _.pick(authority, [
    'description',
    'link',
    'gate',
  ]);
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

  if (!gate && !description) return <AuthorityHeader authority={authority} />;

  return (
    <AccordionItem border='none'>
      <AccordionButton _hover={{ bg: 'white' }} p={0}>
        <AuthorityHeader authority={authority} />
        <AccordionIcon />
      </AccordionButton>
      <AccordionPanel pb={4} px={0}>
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
          <Box pt={link || gate ? 4 : 0}>
            <Text size='sm' variant='medium'>
              Details
            </Text>
            <Markdown smallFont>{description}</Markdown>
          </Box>
        )}
      </AccordionPanel>
    </AccordionItem>
  );
};

export default AuthoritiesListCard;
