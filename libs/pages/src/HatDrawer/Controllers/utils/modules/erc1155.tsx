/* eslint-disable import/prefer-default-export */
import { ModuleParameter } from '@hatsprotocol/modules-sdk';
import _ from 'lodash';
import { Hex } from 'viem';
import { fetchBalance, fetchToken } from 'wagmi/actions';

export const handleErc1155Eligibility = async ({
  tokenParam,
  moduleParameters,
  wearer,
  chainId,
}: {
  tokenParam: ModuleParameter;
  moduleParameters: ModuleParameter[];
  wearer: Hex;
  chainId: number;
}) => {
  const tokenDetails = await fetchToken({
    address: tokenParam.value as Hex,
    chainId,
  });
  const userBalance = await fetchBalance({
    address: wearer,
    token: tokenParam.value as Hex,
    chainId,
  });
  const amountParameter = _.find(moduleParameters, [
    'displayType',
    'amountWithDecimals',
  ]);
};
