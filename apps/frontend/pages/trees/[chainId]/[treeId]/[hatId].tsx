import { treeIdHexToDecimal } from '@hatsprotocol/sdk-v1-core';
import { TreeFormContextProvider, useOverlay } from 'contexts';
import { useIsClient, useMediaStyles } from 'hooks';
import _ from 'lodash';
import { useParams } from 'next/navigation';
import { useRouter } from 'next/router';
import { HatDrawer } from 'pages';
import { useEffect } from 'react';
import { SupportedChains } from 'types';
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
  return result ? _.toNumber(result) : undefined;
};

const hexParam = (param: string | string[] | undefined, size: number = 8) => {
  const result = checkParamForArray(param);
  return result ? numberToHex(_.toNumber(result), { size: 4 }) : undefined;
};

const HatDetails = () => {
  const { updateRecentlyVisitedTrees } = useOverlay();
  const params = useParams();
  const router = useRouter();
  const isClient = useIsClient();
  const { isMobile } = useMediaStyles();
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

  if (!treeId || chainId === '0x' || !chainId) return null;

  if (!isMobile) {
    // TODO any better we can handle this redirect? is it looping? hard to tell but seems so
    router.push(
      `/trees/${chainId}/${treeIdHexToDecimal(treeId)}?hatId=${hatId}`,
    );
  }

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
