'use client';

import { Flex, Heading, Icon, Stack, Text, Tooltip } from '@chakra-ui/react';
import { useEligibility, useOverlay } from 'contexts';
import _ from 'lodash';
import { useHatClaimBy } from 'modules-hooks';
import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import { FaRegCheckCircle } from 'react-icons/fa';
import { explorerUrl, formatAddress } from 'utils';
import { Hex } from 'viem';
import { useAccount, useEnsName } from 'wagmi';

const ChakraNextLink = dynamic(() =>
  import('ui').then((mod) => mod.ChakraNextLink),
);

const WearerCard = ({ account }: { account: Hex }) => {
  const { chainId, selectedHat } = useEligibility();
  const { address } = useAccount();
  const { data: name } = useEnsName({ address: account, chainId: 1 });
  const { handlePendingTx } = useOverlay();

  const isWearing = useMemo(() => {
    return _.some(selectedHat?.wearers, { id: account });
  }, [selectedHat?.wearers, account]);
  const isUser = account === _.toLower(address);

  const { claimHat } = useHatClaimBy({
    selectedHat: selectedHat || undefined,
    chainId,
    wearer: account,
    handlePendingTx,
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
