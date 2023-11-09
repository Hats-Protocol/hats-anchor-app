import { Flex, Heading, HStack, Icon, Stack, Text } from '@chakra-ui/react';
import _ from 'lodash';
import { FaExternalLinkAlt } from 'react-icons/fa';

import ChakraNextLink from '@/components/atoms/ChakraNextLink';
import { HatRole } from '@/types';

const GuildRoles = ({ hatRoles }: { hatRoles: HatRole[] }) => {
  if (_.isEmpty(hatRoles)) return null;

  return (
    <Stack>
      <Heading size='sm' fontWeight='medium' textTransform='uppercase'>
        Guild Roles
      </Heading>
      {hatRoles?.map(({ role, guild }: HatRole) => (
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
  );
};

export default GuildRoles;
