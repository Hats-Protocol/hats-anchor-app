import { Flex, Heading, Icon, Stack, Text, Tooltip } from '@chakra-ui/react';
import { explorerUrl, formatAddress } from 'app-utils';
import { useEligibility } from 'contexts';
import { useHatClaimBy } from 'hats-hooks';
import _ from 'lodash';
import { useMemo } from 'react';
import { FaRegCheckCircle } from 'react-icons/fa';
import { Hex } from 'viem';
import { useAccount, useEnsName } from 'wagmi';

import { ChakraNextLink } from '../atoms';

const WearerCard = ({ account }: { account: Hex }) => {
  const { chainId, selectedHat } = useEligibility();
  const { address } = useAccount();
  const { data: name } = useEnsName({ address: account, chainId: 1 });

  const isWearing = useMemo(() => {
    return _.some(selectedHat?.wearers, { id: account });
  }, [selectedHat?.wearers, account]);
  const isUser = account === _.toLower(address);

  const { claimHat } = useHatClaimBy({
    selectedHat: selectedHat || undefined,
    chainId,
    wearer: account,
  });

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
      {!isWearing && isUser && (
        <Text
          size='sm'
          onClick={claimHat}
          color='blue.500'
          textDecoration='underline'
          _hover={{ color: 'blue.400', cursor: 'pointer' }}
        >
          Claim
        </Text>
      )}
    </Flex>
  );
};

const WearersList = () => {
  const { electionsAuthority } = useEligibility();

  const electedAccounts = useMemo(() => {
    if (!electionsAuthority?.currentTerm) return [];
    const uniqueElectedAccounts = _.uniq(
      electionsAuthority.currentTerm.electedAccounts,
    );
    return uniqueElectedAccounts;
  }, [electionsAuthority.currentTerm]);

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
