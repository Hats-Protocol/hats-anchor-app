/* eslint-disable import/prefer-default-export */
import { Text } from '@chakra-ui/react';
import { ModuleParameter } from '@hatsprotocol/modules-sdk';
import _ from 'lodash';
import dynamic from 'next/dynamic';
import { BsCheckSquareFill } from 'react-icons/bs';
import {
  explorerUrl,
  fetch721Balance,
  fetch721Metadata,
  Fetch721MetadataResult,
  formatAddress,
  ModuleDetailsHandler,
} from 'utils';
import { Hex } from 'viem';

import ChakraNextLink from '../../../../atoms/ChakraNextLink';
import { ELIGIBILITY_STATUS, EligibilityRuleDetails } from '../general';

const RemovedWearer = dynamic(() =>
  import('icons').then((i) => i.RemovedWearer),
);

export const handleErc721Eligibility = async ({
  moduleParameters,
  wearer,
  chainId,
}: ModuleDetailsHandler): Promise<EligibilityRuleDetails> => {
  const tokenParam = _.find(
    moduleParameters,
    (p: ModuleParameter) => p.displayType === 'erc721',
  );
  const promises: Promise<unknown>[] = [
    fetch721Metadata({
      address: tokenParam?.value as Hex,
      chainId,
    }),
  ];
  if (wearer) {
    promises.push(
      fetch721Balance({
        address: wearer,
        token: tokenParam?.value as Hex,
        chainId,
      }),
    );
  }
  const data = await Promise.all(promises);
  const [tokenDetails, userBalance] = data as [
    Fetch721MetadataResult,
    bigint | undefined,
  ];

  const amountParameter = _.find(moduleParameters, {
    label: 'Minimum Balance',
  });
  const amountParameterDisplay =
    (amountParameter?.value as bigint)?.toString() || '0';
  const userBalanceDisplay = userBalance?.toString() || '0';

  return Promise.resolve({
    rule: (
      <Text>
        Hold at least {amountParameterDisplay}{' '}
        <ChakraNextLink
          href={`${explorerUrl(chainId)}/address/${tokenParam?.value}`}
          decoration
        >
          {tokenDetails?.name || formatAddress(tokenParam?.value as Hex)}
        </ChakraNextLink>
      </Text>
    ),
    status:
      userBalance && userBalance >= (amountParameter?.value as bigint)
        ? ELIGIBILITY_STATUS.eligible
        : ELIGIBILITY_STATUS.ineligible,
    displayStatus: userBalanceDisplay,
    icon:
      userBalance && userBalance >= (amountParameter?.value as bigint)
        ? BsCheckSquareFill
        : RemovedWearer,
  });
};
