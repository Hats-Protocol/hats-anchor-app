import { Flex, Heading, HStack, Icon, Stack, Text } from '@chakra-ui/react';
import { FaExternalLinkAlt } from 'react-icons/fa';

import ChakraNextLink from '@/components/atoms/ChakraNextLink';

const GuildRoles = ({ hatRoles }: { hatRoles: any }) => {
  return hatRoles?.length ? (
    <Stack>
      <Heading size='sm' fontWeight='medium' textTransform='uppercase'>
        Guild Roles
      </Heading>
      {hatRoles?.map(({ role, guild }: any) => (
        <Flex
          key={role}
          align='center'
          justify='space-between'
          borderBottom='1px'
          borderColor='gray.200'
          py={2}
        >
          <Text>{role}</Text>
          <ChakraNextLink
            href={`https://guild.xyz/${guild}`}
            isExternal
            display='block'
          >
            <HStack spacing={3}>
              <Text>Guild.xyz</Text>
              <Icon as={FaExternalLinkAlt} w='12px' color='blue.500' />
            </HStack>
          </ChakraNextLink>
        </Flex>
      ))}
    </Stack>
  ) : null;
};

export default GuildRoles;
