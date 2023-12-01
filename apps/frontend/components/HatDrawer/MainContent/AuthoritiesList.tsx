import { Accordion, Heading, Text } from '@chakra-ui/react';
import _ from 'lodash';

import { useTreeForm } from '@/contexts/TreeFormContext';
import { Authority, AuthorityType } from '@/types';

import AuthoritiesListCard from './AuthoritiesListCard';

const AuthoritiesList = () => {
  const { combinedAuthorities } = useTreeForm();

  if (!combinedAuthorities) return null;

  return (
    <Accordion allowMultiple>
      <Heading size='sm' fontWeight='medium' textTransform='uppercase' mb={2}>
        Authorities
      </Heading>

      {_.map(combinedAuthorities, (authority: Authority) => (
        <AuthoritiesListCard
          key={authority.label}
          authority={authority}
          type={authority.type as AuthorityType}
        />
      ))}

      {!combinedAuthorities.length && (
        <Text color='gray.500' fontSize='sm'>
          None
        </Text>
      )}
    </Accordion>
  );
};

export default AuthoritiesList;
