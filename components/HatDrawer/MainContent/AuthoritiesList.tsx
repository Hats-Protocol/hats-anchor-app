import { Accordion, Heading, Text } from '@chakra-ui/react';
import _ from 'lodash';

import { useTreeForm } from '@/contexts/TreeFormContext';
import { AuthorityType } from '@/types';

import AuthoritiesListCard from './AuthoritiesListCard';

const AuthoritiesList = ({ title }: { title: string }) => {
  const toggleOrEligibility =
    title === 'Eligibility Criteria' || title === 'Toggle Criteria';
  const { combinedAuthorities } = useTreeForm();

  if (!combinedAuthorities) return null;

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

      {_.map(combinedAuthorities, (authority) => (
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
