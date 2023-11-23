import {
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Button,
  Card,
  HStack,
  Icon,
  Link,
  Text,
} from '@chakra-ui/react';
import { FaExternalLinkAlt } from 'react-icons/fa';

import ChakraNextLink from '@/components/atoms/ChakraNextLink';
import Markdown from '@/components/atoms/Markdown';
import { AUTHORITY_TYPES, GUILD_PLATFORMS } from '@/constants';
import { getHostnameFromURL, validateURL } from '@/lib/general';
import { Authority, AuthorityType } from '@/types';

import AuthorityHeader from './AuthorityHeader';

const AuthoritiesListCard = ({
  authority,
  type,
}: {
  authority?: Authority;
  type: AuthorityType;
}) => {
  const { label, description, link, gate, imageUrl, id } = authority || {};
  const gateHostName = getHostnameFromURL(gate);

  const img =
    type === AUTHORITY_TYPES.token
      ? GUILD_PLATFORMS[id as keyof typeof GUILD_PLATFORMS].icon
      : imageUrl;

  if (!link && !gate && !description)
    return (
      <Card borderRadius='4px' mb={4} px={4} py={2}>
        <AuthorityHeader label={label} type={type} imageUrl={img} />
      </Card>
    );

  return (
    <AccordionItem borderRadius='4px' boxShadow='md' mb={4}>
      <AccordionButton>
        <AuthorityHeader label={label} type={type} imageUrl={img} />
        <AccordionIcon />
      </AccordionButton>
      <AccordionPanel pb={4} pl={20}>
        <HStack pt={2}>
          {link && validateURL(link) && (
            <ChakraNextLink isExternal href={link} display='block'>
              <Link href={link} isExternal>
                <Button
                  leftIcon={<Icon as={FaExternalLinkAlt} />}
                  colorScheme='blue'
                  size='sm'
                  variant='solid'
                >
                  Link
                </Button>
              </Link>
            </ChakraNextLink>
          )}
          {gate && validateURL(gate) && (
            <ChakraNextLink isExternal href={gate} display='block'>
              <Link href={gate} isExternal>
                <Button
                  rightIcon={<Icon as={FaExternalLinkAlt} />}
                  color='blue.500'
                  borderColor='blue.500'
                  variant='outlineMatch'
                  size='sm'
                >
                  {gateHostName}
                </Button>
              </Link>
            </ChakraNextLink>
          )}
        </HStack>
        {description && (
          <Box pt={link || gate ? 6 : 0}>
            <Text fontSize='sm' fontWeight={500}>
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
