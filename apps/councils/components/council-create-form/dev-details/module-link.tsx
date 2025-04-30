import { cn, Link } from 'ui';
import { explorerUrl, formatAddress } from 'utils';

const ModuleLink = ({
  moduleAddress,
  existingModule,
  required,
  chainId,
}: {
  moduleAddress: string;
  existingModule?: string | null;
  required?: boolean;
  chainId: number;
}) => {
  if (!moduleAddress && !required) return null;
  const useExisting = !!existingModule && existingModule !== 'new';
  const address = useExisting ? existingModule : moduleAddress;

  if (!moduleAddress)
    return (
      <div>
        <p className='text-sm text-red-700'>Missing Module</p>
      </div>
    );

  return (
    <div className={cn('flex items-center gap-2', useExisting && 'text-green-700')}>
      <p className='text-sm'>{useExisting ? 'Existing' : 'New'}</p>
      <Link href={`${explorerUrl(chainId)}/address/${address}`} className='text-sm' isExternal>
        {formatAddress(address)}
      </Link>
    </div>
  );
};

export { ModuleLink };
