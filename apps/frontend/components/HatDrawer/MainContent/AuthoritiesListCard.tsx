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
import { AUTHORITY_TYPES, GUILD_PLATFORMS } from 'app-constants';
import { getHostnameFromURL, validateURL } from 'app-utils';
import { Authority, AuthorityType } from 'hats-types';
import _ from 'lodash';
import { FaExternalLinkAlt } from 'react-icons/fa';

import ChakraNextLink from '../../atoms/ChakraNextLink';
import Markdown from '../../atoms/Markdown';
import AuthorityHeader from './AuthorityHeader';
import ModuleAuthorityToolbar from './ModuleAuthorityToolbar';

const AuthoritiesListCard = ({
  authority,
  type,
}: {
  authority?: Authority;
  type: AuthorityType;
}) => {
  const { label, description, link, gate, imageUrl, id, strategies } =
    authority || {};
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

  const img =
    type === AUTHORITY_TYPES.gate
      ? GUILD_PLATFORMS[id as keyof typeof GUILD_PLATFORMS].icon
      : imageUrl;

  if (!gate && !description)
    return (
      <Card borderRadius='4px' mb={4} p={4}>
        <AuthorityHeader label={label} type={type} imageUrl={img} link={link} />
      </Card>
    );

  return (
    <Card borderRadius='4px' mb={4}>
      <Accordion allowToggle>
        <AccordionItem border='none' mb={4} my={2}>
          <AccordionButton _hover={{ bg: 'white' }}>
            <AuthorityHeader
              label={label}
              type={type}
              imageUrl={img}
              strategies={strategies}
            />
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel pb={4} pl={20}>
            {displayModulesToolbar ? (
              <ModuleAuthorityToolbar authority={authority} />
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
