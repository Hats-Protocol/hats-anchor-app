/* eslint-disable import/prefer-default-export */
import { ModuleParameter } from '@hatsprotocol/modules-sdk';
// import _ from 'lodash';
import { Hex } from 'viem';

export const handleHatWearingEligibility = async ({
  moduleParameters,
  wearer,
  chainId,
}: {
  moduleParameters: ModuleParameter[];
  wearer: Hex;
  chainId: number;
}) => {
  console.log('handleHatWearingEligibility', moduleParameters);
};
