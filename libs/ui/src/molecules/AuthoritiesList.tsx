import { Accordion, Heading, Stack, Text } from '@chakra-ui/react';
import { useTreeForm } from 'contexts';
import { Authority, AuthorityType } from 'hats-types';
import { useMediaStyles } from 'hooks';
import _ from 'lodash';

import AuthoritiesListCard from './AuthoritiesListCard';

const AuthoritiesList = () => {
  const { combinedAuthorities } = useTreeForm();
  const { isMobile } = useMediaStyles();

  if (!combinedAuthorities) return null;

  return (
    <Accordion allowMultiple>
      <Stack>
        {isMobile ? (
          <Heading size='sm' variant='medium'>
            {combinedAuthorities.length} Authorities granted by this Hat
          </Heading>
        ) : (
          <Heading size='sm' variant='medium' textTransform='uppercase'>
            Authorities
          </Heading>
        )}

        <Stack mt={4} gap={4}>
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
