import { WearerIcon } from 'icons';
import { get, includes, map, toLower } from 'lodash';
import { useCallback } from 'react';
import { AllowlistProfile, HatWearer } from 'types';
import { BaseCheckbox, cn } from 'ui';
import { formatAddress } from 'utils';
import { Hex } from 'viem';
import { useAccount, useEnsAvatar } from 'wagmi';

const AddressProfile = ({
  eligibilityAccount,
  ensAvatar,
  isCurrentUser,
  color,
}: {
  eligibilityAccount: AllowlistProfile;
  ensAvatar: string | undefined;
  isCurrentUser: boolean;
  color: string;
}) => (
  <div className={cn('flex items-center gap-1 text-sm', color, isCurrentUser && 'bg-green-100')}>
    {ensAvatar ? (
      <img
        className='ml-[2px] mr-[1px] h-[14px] w-[11px] rounded-[2px] object-cover md:mr-1 md:h-4 md:w-3' // sometimes only ml? oh when the current user isn't a wearer in the list?
        src={ensAvatar}
        alt={eligibilityAccount.ensName || formatAddress(eligibilityAccount.id)}
      />
    ) : (
      <WearerIcon className='h-[14px] w-[14px] md:h-4 md:w-4' />
    )}
    <p className='text-sm'>{eligibilityAccount.ensName || formatAddress(eligibilityAccount.id)}</p>
  </div>
);

export const EligibilityRow = ({
  eligibilityAccount,
  wearers,
  updating,
  updateList,
  handleAdd,
  handleRemove,
}: {
  eligibilityAccount: AllowlistProfile;
  wearers: HatWearer[] | undefined;
  updating?: boolean;
  updateList?: AllowlistProfile[] | undefined;
  handleAdd?: (account: Hex) => void;
  handleRemove?: (address: Hex) => void;
}) => {
  const { address } = useAccount();
  const { data: ensAvatar } = useEnsAvatar({
    name: get(eligibilityAccount, 'ensName') || undefined,
    chainId: 1,
  });
  const isWearer = includes(map(wearers, 'id'), eligibilityAccount.id);
  const isCurrentUser = toLower(address) === toLower(eligibilityAccount.id);

  let color = 'text-informative-human';
  if (isCurrentUser) color = 'text-green-800';
  if (eligibilityAccount.isContract) color = 'text-informative-code';
  const isChecked = includes(map(updateList, 'id'), eligibilityAccount.id);

  const handleRemoveToggle = useCallback(() => {
    if (isChecked) {
      handleRemove?.(eligibilityAccount.id);
    } else {
      handleAdd?.(eligibilityAccount.id);
    }
  }, [isChecked, handleAdd, handleRemove, eligibilityAccount.id]);

  return (
    <div className='flex w-full justify-between'>
      {updating ? (
        <div onClick={handleRemoveToggle} className='flex items-center gap-2'>
          <BaseCheckbox checked={isChecked} />
          <AddressProfile
            eligibilityAccount={eligibilityAccount}
            ensAvatar={ensAvatar || undefined}
            isCurrentUser={isCurrentUser}
            color={color}
          />
        </div>
      ) : (
        <AddressProfile
          eligibilityAccount={eligibilityAccount}
          ensAvatar={ensAvatar || undefined}
          isCurrentUser={isCurrentUser}
          color={color}
        />
      )}

      <div className='flex items-center gap-1 text-sm'>
        <p className={cn(isWearer ? 'text-informative-human' : 'text-gray-500')}>{isWearer ? 'Wearer' : 'Unclaimed'}</p>
      </div>
    </div>
  );
};
