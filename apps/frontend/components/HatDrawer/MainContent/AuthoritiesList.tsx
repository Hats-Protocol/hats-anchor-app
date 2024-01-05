import { Accordion, Heading, Text } from '@chakra-ui/react';
import { Authority, AuthorityType } from 'hats-types';
import { isTopHat } from 'hats-utils';
import _ from 'lodash';

import { useTreeForm } from '../../../contexts/TreeFormContext';
import AuthoritiesListCard from './AuthoritiesListCard';

const AuthoritiesList = () => {
  const { topHatAuthorities, nonTopHatAuthorities, selectedHat } =
    useTreeForm();
  const authorities = isTopHat(selectedHat)
    ? topHatAuthorities
    : nonTopHatAuthorities;

  if (!authorities) return null;

  return (
    <Accordion allowMultiple>
      <Heading size='sm' fontWeight='medium' textTransform='uppercase' mb={2}>
        Authorities
      </Heading>
      {_.map(authorities, (authority: Authority, index: number) => (
        <AuthoritiesListCard
          index={index}
          key={authority.label}
          authority={authority}
          type={authority.type as AuthorityType}
        />
      ))}
      {!authorities.length && (
        <Text color='gray.500' fontSize='sm'>
          None
        </Text>
      )}
    </Accordion>
  );
};

export default AuthoritiesList;
