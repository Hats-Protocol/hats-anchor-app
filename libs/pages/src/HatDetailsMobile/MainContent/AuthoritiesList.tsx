import { Accordion, Heading, Stack, Text } from '@chakra-ui/react';
import { useTreeForm } from 'contexts';
import { Authority } from 'hats-types';
import _ from 'lodash';
import dynamic from 'next/dynamic';

const AuthorityItemMobile = dynamic(() =>
  import('ui').then((mod) => mod.AuthorityItemMobile),
);

const AuthoritiesList = () => {
  const { combinedAuthorities } = useTreeForm();

  if (!combinedAuthorities) return null;

  return (
    <Accordion allowMultiple>
      <Stack>
        <Heading size='sm' variant='medium'>
          {combinedAuthorities.length} Authorities granted by this hat
        </Heading>
        {_.map(combinedAuthorities, (authority: Authority, index: number) => (
          <AuthorityItemMobile key={authority.label} authority={authority} />
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
