import { Accordion, Flex, Heading, Stack, Text } from '@chakra-ui/react';
import { useTreeForm } from 'contexts';
import _ from 'lodash';
import { Authority, AuthorityType } from 'types';

import AuthoritiesListCard from './AuthoritiesListCard';

const AuthoritiesList = () => {
  const { combinedAuthorities } = useTreeForm();

  if (!combinedAuthorities) return null;

  if (_.isEmpty(combinedAuthorities)) {
    return (
      <Flex px={{ base: 4, md: 10 }}>
        <Heading size={{ base: 'sm', md: 'md' }} variant='medium'>
          No Authorities found for Wearers currently
        </Heading>
      </Flex>
    );
  }

  return (
    <Accordion px={{ base: 0, md: 10 }} allowMultiple>
      <Stack>
        <Heading
          size={{ base: 'sm', md: 'md' }}
          mx={{ base: 4, md: 0 }}
          variant='medium'
        >
          {_.size(combinedAuthorities)}{' '}
          {_.size(combinedAuthorities) > 1 ? 'Authorities' : 'Authority'}{' '}
          granted by this Hat
        </Heading>

        <Stack spacing={1}>
          {_.map(combinedAuthorities, (authority: Authority, index: number) => (
            <AuthoritiesListCard
              index={index}
              key={authority.label}
              authority={authority}
              type={authority.type as AuthorityType}
            />
          ))}
        </Stack>
        {!combinedAuthorities.length && (
          <Text variant='gray' size='sm'>
            None
          </Text>
        )}
      </Stack>
    </Accordion>
  );
};

export default AuthoritiesList;
