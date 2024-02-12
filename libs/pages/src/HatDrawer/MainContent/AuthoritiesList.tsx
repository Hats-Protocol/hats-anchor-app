import { Accordion, Heading, Stack, Text } from '@chakra-ui/react';
import { useTreeForm } from 'contexts';
import { Authority, AuthorityType } from 'hats-types';
import _ from 'lodash';
import dynamic from 'next/dynamic';

const AuthoritiesListCard = dynamic(() =>
  import('ui').then((mod) => mod.AuthoritiesListCard),
);

const AuthoritiesList = () => {
  const { combinedAuthorities } = useTreeForm();

  if (!combinedAuthorities) return null;

  return (
    <Accordion allowMultiple>
      <Stack>
        <Heading size='sm' variant='medium' textTransform='uppercase'>
          Authorities
        </Heading>
        {_.map(combinedAuthorities, (authority: Authority, index: number) => (
          <AuthoritiesListCard
            index={index}
            key={authority.label}
            authority={authority}
            type={authority.type as AuthorityType}
          />
        ))}
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
