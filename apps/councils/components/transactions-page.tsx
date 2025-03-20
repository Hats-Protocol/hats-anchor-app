'use client';

import { useCouncilDetails } from 'hooks';
import { pick } from 'lodash';
import { Hex } from 'viem';

import SafeTransactions from './safe-list/safe-transactions';

const TransactionsPage = ({ chainId, hsg }: { chainId: number; hsg: Hex }) => {
  const { data } = useCouncilDetails({ chainId, address: hsg });
  const { safe: safeAddress } = pick(data, ['safe']);

  return (
    <div>
      <SafeTransactions hsg={hsg} safeAddress={safeAddress as Hex} chainId={chainId} />
    </div>
  );
};

export { TransactionsPage };
