import { Button, Flex, Heading, Icon, Stack } from '@chakra-ui/react';
import { filter, get, includes, isEmpty, map, size } from 'lodash';
import dynamic from 'next/dynamic';
import { AllowlistProfile, HatWearer } from 'types';

const WearerIcon = dynamic(() => import('icons').then((mod) => mod.WearerIcon));

export const WearerFilters = ({
  extendedProfiles,
  wearers,
}: {
  extendedProfiles: AllowlistProfile[] | undefined;
  wearers: HatWearer[] | undefined;
}) => {
  const eligible = filter(extendedProfiles, (p) => {
    return get(p, 'eligible') && !get(p, 'badStanding');
  });
  const contracts = filter(extendedProfiles, { isContract: true });
  const multiSigs = filter(extendedProfiles, {
    contractName: 'GnosisSafeProxy',
  });
  const humanistic = filter(extendedProfiles, { isContract: false });

  const wearerIds = map(wearers, 'id');
  const wearerProfiles = filter(extendedProfiles, (p) =>
    includes(wearerIds, p.id),
  );
  const unclaimed = filter(extendedProfiles, (p) => !includes(wearerIds, p.id));

  const goodStanding = filter(extendedProfiles, { badStanding: false });
  const badStanding = filter(extendedProfiles, { badStanding: true });

  if (!extendedProfiles || !wearers) return null;

  return (
    <Stack>
      <Heading size='sm'>
        {size(eligible)} allowed addresses{' '}
        <span className='font-normal'>of {size(extendedProfiles)} entries</span>
      </Heading>

      <Flex wrap='wrap' gap={2}>
        <Button
          leftIcon={<Icon as={WearerIcon} />}
          size='xs'
          variant='outlineMatch'
          colorScheme='Informative-Human'
        >
          {size(humanistic)} Address{size(humanistic) > 1 ? 'es' : ''}
        </Button>
        {!isEmpty(multiSigs) && (
          <Button
            size='xs'
            variant='outlineMatch'
            colorScheme='Informative-Human'
          >
            {size(multiSigs)} Multi-sigs
          </Button>
        )}
        {!isEmpty(contracts) && (
          <Button
            size='xs'
            variant='outlineMatch'
            colorScheme='Informative-Code'
          >
            {size(contracts)} Contract{size(contracts) > 1 ? 's' : ''}
          </Button>
        )}
        {!isEmpty(wearerProfiles) && (
          <Button size='xs' variant='outlineMatch' colorScheme='blue.500'>
            {size(wearerProfiles)} Wearer{size(wearerProfiles) > 1 ? 's' : ''}
          </Button>
        )}
        {!isEmpty(unclaimed) && (
          <Button size='xs' variant='outlineMatch' colorScheme='gray'>
            {size(unclaimed)} Unclaimed
          </Button>
        )}
        {!isEmpty(goodStanding) && (
          <Button size='xs' variant='outlineMatch' colorScheme='green'>
            {size(goodStanding)} Good Standing
          </Button>
        )}
        {!isEmpty(badStanding) && (
          <Button size='xs' variant='outlineMatch' colorScheme='red'>
            {size(badStanding)} Bad Standing
          </Button>
        )}
      </Flex>
    </Stack>
  );
};
