import {
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Button,
  HStack,
  Icon,
  Link,
  Text,
} from '@chakra-ui/react';
import { FaExternalLinkAlt } from 'react-icons/fa';

import ChakraNextLink from '@/components/atoms/ChakraNextLink';
import Markdown from '@/components/atoms/Markdown';
import { validateURL } from '@/lib/general';
import { Authority, AuthorityType } from '@/types';

import AuthorityHeader from './AuthorityHeader';

const AuthoritiesListCard = ({
  authority,
  type,
}: {
  authority?: Authority;
  type: AuthorityType;
}) => {
  const { label, description, link, gate, imageUrl } = authority || {};
  const mainUrlRegex = /(?:https?:\/\/)?(?:www\.)?([^/:?#]+)/;

  if (!link && !gate && !description)
    return (
      <Box
        borderRadius='4px'
        border='1px solid var(--gray-100, #EDF2F7)'
        boxShadow='0px 1px 2px 0px rgba(0, 0, 0, 0.06), 0px 1px 3px 0px rgba(0, 0, 0, 0.10)'
        mb={4}
        px={4}
        py={2}
      >
        <AuthorityHeader label={label} type={type} imageUrl={imageUrl} />
      </Box>
    );

  return (
    <AccordionItem
      borderRadius='4px'
      border='1px solid var(--gray-100, #EDF2F7)'
      boxShadow='0px 1px 2px 0px rgba(0, 0, 0, 0.06), 0px 1px 3px 0px rgba(0, 0, 0, 0.10)'
      mb={4}
    >
      <AccordionButton>
        <AuthorityHeader label={label} type={type} imageUrl={imageUrl} />
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
                  colorScheme='blue'
                  borderColor='blue.500'
                  size='sm'
                  variant='outline'
                  color='blue.500'
                >
                  {gate.match(mainUrlRegex)?.[1]}
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
