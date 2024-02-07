import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Button,
  Card,
  HStack,
  Icon,
  IconButton,
  Text,
} from '@chakra-ui/react';
import { AUTHORITY_TYPES } from '@hatsprotocol/constants';
import { getHostnameFromURL, validateURL } from 'app-utils';
import { Authority, AuthorityType } from 'hats-types';
import _ from 'lodash';
import { FaExternalLinkAlt } from 'react-icons/fa';

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
    type === AUTHORITY_TYPES.modules || type === AUTHORITY_TYPES.hsg;

  if (!gate && !description)
    return (
      <Card borderRadius='4px' mb={4} p={4}>
        <AuthorityHeader authority={authority} />
      </Card>
    );

  return (
    <Card borderRadius='4px' mb={4}>
      <Accordion allowToggle>
        <AccordionItem border='none' mb={4} my={2}>
          <AccordionButton _hover={{ bg: 'white' }}>
            <AuthorityHeader authority={authority} />
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel pb={4} pl={20}>
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
                <Text fontSize='sm' fontWeight={500}>
                  Details
                </Text>
                <Markdown smallFont>{description}</Markdown>
              </Box>
            )}
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </Card>
  );
};

export default AuthoritiesListCard;
