import { Flex, Heading, Icon, Stack, Text, Tooltip } from '@chakra-ui/react';
import { explorerUrl, formatAddress } from 'app-utils';
import _ from 'lodash';
import { useMemo } from 'react';
import { FaRegCheckCircle } from 'react-icons/fa';
import { ChakraNextLink } from 'ui';
import { Hex } from 'viem';
import { useEnsName } from 'wagmi';

import { useEligibility } from '../../contexts/EligibilityContext';

const WearerCard = ({ account }: { account: Hex }) => {
  const { chainId, selectedHat } = useEligibility();
  const { data: name } = useEnsName({ address: account, chainId: 1 });
  const isWearing = useMemo(() => {
    return _.some(selectedHat?.wearers, { id: account });
  }, [selectedHat?.wearers, account]);

  return (
    <Flex justify='space-between' w='100%'>
      <ChakraNextLink
        href={`${explorerUrl(chainId)}/address/${account}`}
        decoration
      >
        <Text size='sm'>{name || formatAddress(account)}</Text>
      </ChakraNextLink>

      {isWearing && (
        <Tooltip label='is wearing hat' shouldWrapChildren>
          <Icon as={FaRegCheckCircle} color='green.500' />
        </Tooltip>
      )}
    </Flex>
  );
};

const WearersList = () => {
  const { electionsAuthority } = useEligibility();

  const electedAccounts = useMemo(() => {
    const allElectedAccounts = _.flatMap(
      electionsAuthority?.terms,
      'electedAccounts',
    );
    const uniqueElectedAccounts = _.uniq(allElectedAccounts);
    return _.compact(uniqueElectedAccounts);
  }, [electionsAuthority?.terms]);

  return (
    <Stack spacing={4}>
      <Heading size='md'>Current Electees</Heading>
      {!_.isEmpty(electedAccounts) ? (
        <Stack spacing={2} align='start' w='100%'>
          {_.map(electedAccounts, (account: Hex) => (
            <WearerCard key={account} account={account} />
          ))}
        </Stack>
      ) : (
        <Text>No elected accounts currently</Text>
      )}
    </Stack>
  );
};

export default WearersList;
