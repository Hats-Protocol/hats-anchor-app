'use client';

import { hatIdToTreeId } from '@hatsprotocol/sdk-v1-core';
import _ from 'lodash';
import { useRouter } from 'next/router';
import { ipToHatId } from 'shared';

const checkParamForArray = (param: string | string[] | undefined) => {
  let result: string | undefined;
  if (_.isArray(param)) {
    result = _.first(param);
  } else {
    result = param as string;
  }
  return result;
};

const useHatParams = () => {
  const router = useRouter();
  // QUERY PARAMS
  const { hatId: initialHatIdParam, chainId: initialChainIdParam } = _.pick(
    _.get(router, 'query'),
    ['hatId', 'chainId'],
  );

  const initialHatId = checkParamForArray(initialHatIdParam);
  const selectedHatId = ipToHatId(initialHatId) || undefined;

  return {
    selectedHatId,
    treeId:
      selectedHatId !== '0x' ? hatIdToTreeId(BigInt(selectedHatId)) : undefined,
    chainId: _.toNumber(initialChainIdParam),
  };
};

export default useHatParams;
