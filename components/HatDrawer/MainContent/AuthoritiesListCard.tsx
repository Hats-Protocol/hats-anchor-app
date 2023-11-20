import {
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Avatar,
  Box,
  Button,
  Circle,
  HStack,
  Icon,
  IconButton,
  Link,
  Text,
  Tooltip,
} from '@chakra-ui/react';
import { BsInfoCircle } from 'react-icons/bs';
import { FaExternalLinkAlt } from 'react-icons/fa';

import ChakraNextLink from '@/components/atoms/ChakraNextLink';
import Markdown from '@/components/atoms/Markdown';
import { validateURL } from '@/lib/general';
import { ipfsUrl } from '@/lib/ipfs';
import { Authority } from '@/types';

type AuthorityType = 'token' | 'admin' | 'social';

const AuthoritiesList = ({
  authority,
  type,
}: {
  authority?: Authority;
  type: AuthorityType;
}) => {
  const { label, description, link, gate, imageUrl } = authority || {};
  const isIpfs = imageUrl?.startsWith('ipfs://');
  const mainUrlRegex = /(?:https?:\/\/)?(?:www\.)?([^/:?#]+)/;

  const types = {
    token: {
      label: 'Connected Token-gated Authority',
      info: 'Retrieved from the blockchain',
      color: 'green.300',
    },
    admin: {
      label: 'Admin Connected Authority',
      info: 'Automatically retrieved from Snapshot',
      color: 'blue.300',
    },
    social: {
      label: 'Social Authority',
      info: 'Appended off-chain for clarity',
      color: 'purple.300',
    },
  };

  return (
    <AccordionItem
      borderRadius='4px'
      border='1px solid var(--gray-100, #EDF2F7)'
      boxShadow='0px 1px 2px 0px rgba(0, 0, 0, 0.06), 0px 1px 3px 0px rgba(0, 0, 0, 0.10)'
      mb={4}
    >
      {/* if there is no data to expand don't use acc. button, but some card */}
      <AccordionButton>
        <HStack spacing={4} w='full'>
          <Avatar
            size='md'
            src={isIpfs ? ipfsUrl(imageUrl?.slice(7)) : imageUrl}
          />
          <Box textAlign='left'>
            <Text>{label}</Text>
            <HStack>
              <Circle size='10px' bg={types[type].color} />
              <Text>{types[type].label}</Text>
              <Tooltip label={types[type].info}>
                <IconButton
                  aria-label='Info'
                  icon={<Icon as={BsInfoCircle} />}
                  size='xs'
                  variant='ghost'
                />
              </Tooltip>
            </HStack>
          </Box>
        </HStack>
        <AccordionIcon />
      </AccordionButton>
      <AccordionPanel pb={4} pl={20}>
        <HStack pt={2} pb={6}>
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
          <Box>
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

export default AuthoritiesList;
