'use client';

import { Text } from '@chakra-ui/react';
import { find, pick } from 'lodash';
import { useErc721Details } from 'modules-hooks';
import dynamic from 'next/dynamic';
import { BsCheckSquareFill } from 'react-icons/bs';
import { ChakraNextLink } from 'ui';
import { explorerUrl, formatAddress, ModuleDetailsHandler } from 'utils';
import { Hex } from 'viem';

import { ELIGIBILITY_STATUS } from '../utils';
import EligibilityRule from './EligibilityRule';

const RemovedWearer = dynamic(() =>
  import('icons').then((i) => i.RemovedWearer),
);

const Erc721Eligibility = ({
  moduleParameters,
  wearer,
  chainId,
}: ModuleDetailsHandler) => {
  const tokenParam = find(moduleParameters, { displayType: 'erc721' });

  const { data: erc721Details } = useErc721Details({
    contractAddress: tokenParam?.value as Hex,
    wearerAddress: wearer,
    chainId,
  });
  const { tokenDetails, userBalance, userBalanceDisplay } = pick(
    erc721Details,
    ['tokenDetails', 'userBalance', 'userBalanceDisplay'],
  );

  const amountParameter = find(moduleParameters, {
    label: 'Minimum Balance',
  });
  const amountParameterDisplay =
    (amountParameter?.value as bigint)?.toString() || '0';

  return (
    <EligibilityRule
      rule={
        <Text size={{ base: 'sm', md: 'md' }}>
          Hold at least {amountParameterDisplay}{' '}
          <ChakraNextLink
            href={`${explorerUrl(chainId)}/address/${tokenParam?.value}`}
            decoration
          >
            {tokenDetails?.name || formatAddress(tokenParam?.value as Hex)}
          </ChakraNextLink>
        </Text>
      }
      status={
        userBalance && userBalance >= (amountParameter?.value as bigint)
          ? ELIGIBILITY_STATUS.eligible
          : ELIGIBILITY_STATUS.ineligible
      }
      displayStatus={userBalanceDisplay}
      icon={
        userBalance && userBalance >= (amountParameter?.value as bigint)
          ? BsCheckSquareFill
          : RemovedWearer
      }
    />
  );
};

export default Erc721Eligibility;
