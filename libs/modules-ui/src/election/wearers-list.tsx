'use client';

import { useEligibility, useOverlay } from 'contexts';
import { isEmpty, map, some, toLower } from 'lodash';
import { useAncillaryElection, useHatClaimBy } from 'modules-hooks';
import { useMemo } from 'react';
import { FaRegCheckCircle } from 'react-icons/fa';
import { SupportedChains } from 'types';
import { Link } from 'ui';
import { Tooltip } from 'ui';
import { explorerUrl, formatAddress } from 'utils';
import { Hex } from 'viem';
import { useAccount, useEnsName } from 'wagmi';

const WearerCard = ({ account }: { account: Hex }) => {
  const { chainId, selectedHat } = useEligibility();
  const { address } = useAccount();
  const { data: name } = useEnsName({ address: account, chainId: 1 });
  const { handlePendingTx } = useOverlay();

  const isWearing = useMemo(() => {
    return some(selectedHat?.wearers, { id: account });
  }, [selectedHat?.wearers, account]);
  const isUser = account === toLower(address);

  const { claimHat } = useHatClaimBy({
    selectedHat: selectedHat || undefined,
    chainId,
    wearer: account,
    handlePendingTx,
  });

  return (
    <div className='flex w-full justify-between'>
      <Link href={`${explorerUrl(chainId)}/address/${account}`} className='underline'>
        <p className='text-sm'>{name || formatAddress(account)}</p>
      </Link>

      {isWearing && (
        <Tooltip label='is wearing hat'>
          <FaRegCheckCircle className='text-green-500' />
        </Tooltip>
      )}
      {!isWearing && isUser && (
        <p className='cursor-pointer text-sm text-blue-500 underline hover:text-blue-400' onClick={claimHat}>
          Claim
        </p>
      )}
    </div>
  );
};

export const WearersList = () => {
  const { chainId, activeRule } = useEligibility();
  const { data: electionsAuthority } = useAncillaryElection({
    chainId: chainId as SupportedChains,
    id: activeRule?.address,
  });

  const electedAccounts: any[] = [];
  // const electedAccounts = useMemo(() => {
  //   if (!electionsAuthority?.currentTerm) return [];
  //   const uniqueElectedAccounts = _.uniq(
  //     electionsAuthority.currentTerm.electedAccounts,
  //   );
  //   return uniqueElectedAccounts;
  // }, [electionsAuthority.currentTerm]);

  return (
    <div className='space-y-4'>
      <h3 className='text-md'>Current Electees</h3>
      {!isEmpty(electedAccounts) ? (
        <div className='space-y-2'>
          {map(electedAccounts, (account: Hex) => (
            <WearerCard key={account} account={account} />
          ))}
        </div>
      ) : (
        <p>No elected accounts currently</p>
      )}
    </div>
  );
};
