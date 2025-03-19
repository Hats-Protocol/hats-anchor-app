'use client';

import { useCouncilDetails, usePendingSafeTransactions, useSafeTransactions } from 'hooks';
import { pick, toLower } from 'lodash';
import { logger } from 'utils';
import { Hex } from 'viem';

import { SafeTransactions } from './safe-list/safe-transactions';

const TransactionsPage = ({ chainId, hsg }: { chainId: number; hsg: Hex }) => {
  const { data } = useCouncilDetails({ chainId, address: hsg });
  const { safe: safeAddress } = pick(data, ['safe']);

  // logger.info('hsg', toLower(hsg));
  // const { data: safeTransactions } = useSafeTransactions({
  //   safeAddress,
  //   chainId,
  // });
  // const { data: pendingSafeTransactions } = usePendingSafeTransactions({
  //   safeAddress,
  //   chainId,
  // });

  // logger.info({ safeTransactions, pendingSafeTransactions });
  return (
    <div>
      <SafeTransactions safeAddress={safeAddress as Hex} chainId={chainId} />
    </div>
  );
};

export { TransactionsPage };
