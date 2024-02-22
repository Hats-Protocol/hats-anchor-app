import { Accordion, Heading, Stack, Text } from '@chakra-ui/react';
import { useTreeForm } from 'contexts';
import { Authority, AuthorityType } from 'hats-types';
import _ from 'lodash';

import AuthoritiesListCard from './AuthoritiesListCard';

const AuthoritiesList = () => {
  const { combinedAuthorities } = useTreeForm();

  if (!combinedAuthorities) return null;

  return (
    <Accordion allowMultiple px={{ base: 4, md: 10 }}>
      <Stack>
        <Heading size='sm' variant='bold'>
          {combinedAuthorities.length} Authorities granted by this Hat
        </Heading>

        <Stack mt={4} spacing={2}>
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
