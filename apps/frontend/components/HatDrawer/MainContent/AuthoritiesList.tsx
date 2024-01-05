import { Accordion, Heading, Text } from '@chakra-ui/react';
import { Authority, AuthorityType } from 'hats-types';
import _ from 'lodash';

import { useTreeForm } from '../../../contexts/TreeFormContext';
import AuthoritiesListCard from './AuthoritiesListCard';

const AuthoritiesList = () => {
  const { combinedAuthorities } = useTreeForm();

  if (!combinedAuthorities) return null;

  return (
    <Accordion allowMultiple>
      <Heading size='sm' fontWeight='medium' textTransform='uppercase' mb={2}>
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
        <Text color='gray.500' fontSize='sm'>
          None
        </Text>
      )}
    </Accordion>
  );
};

export default AuthoritiesList;
