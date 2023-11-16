import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Avatar,
  Box,
  Button,
  Circle,
  Heading,
  HStack,
  Icon,
  Link,
  Text,
} from '@chakra-ui/react';
import { FaExternalLinkAlt } from 'react-icons/fa';

import ChakraNextLink from '@/components/atoms/ChakraNextLink';
import Markdown from '@/components/atoms/Markdown';
import { validateURL } from '@/lib/general';
import { ipfsUrl } from '@/lib/ipfs';
import { Authority } from '@/types';

const AuthoritiesList = ({
  title,
  authorities,
}: {
  title: string;
  authorities?: Authority[];
}) => {
  const toggleOrEligibility =
    title === 'Eligibility Criteria' || title === 'Toggle Criteria';

  const mainUrlRegex = /(?:https?:\/\/)?(?:www\.)?([^/:?#]+)/;

  function getAuthorityType() {
    const types = [
      'Connected Token-gated Authority',
      'Admin Connected Authority',
      'Social Authority',
    ];
    return types[Math.floor(Math.random() * types.length)]; // Replace with your actual logic
  }

  const authorityType = getAuthorityType();

  const dotColor =
    // eslint-disable-next-line no-nested-ternary
    authorityType === 'Connected Token-gated Authority'
      ? 'green.300'
      : authorityType === 'Admin Connected Authority'
      ? 'blue.300'
      : 'purple.300';

  return (
    <Accordion allowMultiple>
      {!toggleOrEligibility && (
        <Heading
          size={toggleOrEligibility ? 'xs' : 'sm'}
          fontWeight='medium'
          textTransform='uppercase'
          mb={2}
        >
          {title}
        </Heading>
      )}
      {authorities?.length ? (
        authorities.map(
          ({ label, link, gate, imageUrl, description }: Authority) => (
            <AccordionItem
              key={label}
              borderRadius='4px'
              border='1px solid var(--gray-100, #EDF2F7)'
              boxShadow='0px 1px 2px 0px rgba(0, 0, 0, 0.06), 0px 1px 3px 0px rgba(0, 0, 0, 0.10)'
            >
              <AccordionButton>
                <HStack spacing={4} w='full'>
                  <Avatar size='md' src={ipfsUrl(imageUrl?.slice(7))} />
                  <Box textAlign='left'>
                    <Text>{label}</Text>
                    <HStack>
                      <Circle size='10px' bg={dotColor} />
                      <Text>{authorityType}</Text>
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
                          Snapshot
                        </Button>
                      </Link>
                    </ChakraNextLink>
                  )}
                  {gate && validateURL(gate) && (
                    <ChakraNextLink isExternal href={gate} display='block'>
                      <Link href={gate} isExternal>
                        <Button
                          leftIcon={<Icon as={FaExternalLinkAlt} />}
                          colorScheme='blue'
                          size='sm'
                          variant='outline'
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
          ),
        )
      ) : (
        <Text>None</Text>
      )}
    </Accordion>
  );
};

export default AuthoritiesList;
