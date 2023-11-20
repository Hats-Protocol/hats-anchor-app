import { Accordion, Heading, Text } from '@chakra-ui/react';
import _ from 'lodash';

import { useTreeForm } from '@/contexts/TreeFormContext';
import { Authority } from '@/types';

import AuthoritiesListCard from './AuthoritiesListCard';

const AuthoritiesList = ({
  title,
  authorities,
}: {
  title: string;
  authorities?: Authority[];
}) => {
  const toggleOrEligibility =
    title === 'Eligibility Criteria' || title === 'Toggle Criteria';
  const { selectedHatGuildRoles } = useTreeForm();
  const list = [...(authorities || []), ...(selectedHatGuildRoles || [])];

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

      {_.map(authorities, (authority) => (
        <AuthoritiesListCard
          key={authority.label}
          authority={authority}
          type='social'
        />
      ))}

      {_.map(selectedHatGuildRoles, (authority) => (
        <AuthoritiesListCard
          key={authority.label}
          authority={authority}
          type='token'
        />
      ))}

      {!list.length && (
        <Text color='gray.500' fontSize='sm'>
          None
        </Text>
      )}

      {/* handle the case where there are no authorities */}
    </Accordion>
  );
};

export default AuthoritiesList;
