import { treeIdHexToDecimal } from '@hatsprotocol/sdk-v1-core';
import { TreeFormContextProvider, useOverlay } from 'contexts';
import { SupportedChains } from 'hats-types';
import { useIsClient } from 'hooks';
import _ from 'lodash';
import { useParams } from 'next/navigation';
import { HatDrawer } from 'pages';
import { useEffect } from 'react';
import { numberToHex } from 'viem';

const checkParamForArray = (param: string | string[] | undefined) => {
  let result: string | undefined;
  if (_.isArray(param)) {
    result = _.first(param);
  } else {
    result = param as string;
  }
  return result;
};

const numberParam = (param: string | string[] | undefined) => {
  const result = checkParamForArray(param);
  return result ? parseInt(result, 10) : undefined;
};

const hexParam = (param: string | string[] | undefined, size: number = 8) => {
  const result = checkParamForArray(param);
  return result ? numberToHex(_.toNumber(result), { size: 4 }) : undefined;
};

const HatDetails = () => {
  const { updateRecentlyVisitedTrees } = useOverlay();
  const params = useParams();
  const isClient = useIsClient();
  const {
    treeId: treeIdParam,
    chainId: chainIdParam,
    hatId: hatIdParam,
  } = _.pick(params, ['treeId', 'chainId', 'hatId']);
  const treeId = hexParam(treeIdParam);
  const chainId = numberParam(chainIdParam);
  const hatId = checkParamForArray(hatIdParam);

  useEffect(() => {
    if (!treeId || !chainId) return;

    updateRecentlyVisitedTrees({
      treeId: treeIdHexToDecimal(treeId),
      chainId,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [treeId, chainId]);

  return (
    <TreeFormContextProvider
      treeId={treeId}
      chainId={chainId as SupportedChains}
      hatId={hatId}
    >
      {isClient && <HatDrawer />}
    </TreeFormContextProvider>
  );
};

export default HatDetails;
