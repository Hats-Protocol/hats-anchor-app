import { treeIdDecimalToHex } from '@hatsprotocol/sdk-v1-core';
import {
  EligibilityContextProvider,
  useStandaloneOverlay as useOverlay,
} from 'contexts';
import _ from 'lodash';
import { GetStaticPropsContext } from 'next';
import { Claims } from 'pages';
import { useEffect } from 'react';
import { ipToHatId } from 'shared';
import { SupportedChains } from 'types';
import { Hex } from 'viem';

const TreeDetails = ({ treeId, hatId, chainId }: TreeDetailsProps) => {
  const { updateRecentlyVisitedHats } = useOverlay();
  useEffect(() => {
    if (!hatId || !chainId) return;

    updateRecentlyVisitedHats({
      hatId,
      chainId,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [treeId, chainId]);

  return (
    <EligibilityContextProvider treeId={treeId} hatId={hatId} chainId={chainId}>
      <Claims />
    </EligibilityContextProvider>
  );
};

const defaultProps = {
  treeId: null,
  chainId: null,
};

export const getStaticProps = async (context: GetStaticPropsContext) => {
  const hatIdParam = _.get(context, 'params.hatId');
  const chainIdParam = _.get(context, 'params.chainId');
  const treeId = _.isArray(hatIdParam) ? _.first(hatIdParam) : hatIdParam;
  const chainId = _.isArray(chainIdParam)
    ? _.toNumber(_.first(chainIdParam))
    : _.toNumber(chainIdParam);

  if (!treeId || treeId === 'undefined' || !chainId) {
    return { props: defaultProps };
  }

  const extractIds = (inputString: string) => {
    const parts = inputString.split('.');
    return { treeId: parts[0], hatId: inputString };
  };

  const { treeId: extractedTreeId, hatId } = extractIds(treeId);

  return {
    props: {
      ...defaultProps,
      treeId: treeIdDecimalToHex(_.toNumber(extractedTreeId)),
      hatId: ipToHatId(hatId),
      chainId: _.toNumber(chainId),
    },
    revalidate: 5,
  };
};

export const getStaticPaths = async () => {
  return {
    paths: [],
    fallback: 'blocking',
  };
};

export default TreeDetails;

interface TreeDetailsProps {
  treeId: Hex;
  hatId: Hex;
  chainId: SupportedChains;
}
