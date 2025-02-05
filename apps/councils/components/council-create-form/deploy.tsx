import { useClipboard } from 'hooks';
import { Check, Link } from 'lucide-react';
import { useMemo } from 'react';
import { Button, cn } from 'ui';

interface DeployStatus {
  [key: string]: boolean;
}

const deploySteps = {
  pinningRoleDetails: {
    title: 'Create Council',
    description: 'Creating a Hats tree to store roles & rules alongside a Safe Multisig',
  }, // skip `calculatingRoleMetadata`
  configuringModules: {
    title: 'Deploying your smart contract rules',
    description: 'Deploying HSG, Allowlist, Compliance & Agreement',
  }, // skip `chainModules`
  simulateSafeAddress: {
    title: 'Simulating Safe address',
    description: 'Registering and reserving the Safe address',
  },
  allocatingInitialRoles: {
    title: 'Compiling Transaction Calldata',
    description: 'Compiling a transaction that deploys the necessary contracts with allocates roles',
  }, // bundle with `compileTxCalldata`
  deployTx: {
    title: 'Waiting for wallet confirmation',
    description: 'You need to confirm and send the transaction',
  },
  confirmingTx: {
    title: 'Waiting for blockchain confirmation',
    description: 'Network is including this transaction into a block',
  },
  indexingTx: {
    title: 'Wait for indexing',
    description: 'Storing blockchain information as structured metadata',
  },
  processTx: {
    title: 'Processing transaction',
    description: "We're activating your permissions",
  }, // bundle with `updateMetadata`
  redirect: {
    title: 'Redirecting to the Council',
    description: 'Constructing your Hats Pro control panel and redirecting you to it',
  },
};

const Deploy = ({ draftId, deployStatus }: { draftId: string; deployStatus: DeployStatus }) => {
  const draftUrl = useMemo(() => {
    if (typeof window === 'undefined') return '';
    return `${window.location.origin}/councils/new/payment?draftId=${draftId}`;
  }, [draftId]);
  const { onCopy: copyUrl } = useClipboard(draftUrl, {
    toastData: { variant: 'success', title: 'Copied share link to clipboard' },
  });

  return (
    <div className='space-y-6'>
      <div className='relative flex justify-center border-b border-gray-200 pb-6'>
        <div className='flex flex-col items-center gap-4'>
          <h2 className='text-3xl font-medium'>Deploying Council</h2>
          <p className='max-w-sm text-center text-xs text-gray-600'>
            This may take a moment. You&apos;ll be prompted with a transaction to deploy the council shortly.
          </p>
        </div>

        <Button type='button' variant='outline-blue' rounded='full' className='absolute right-0' onClick={copyUrl}>
          <Link className='h-4 w-4' /> Copy link
        </Button>
      </div>

      <div className='flex flex-col gap-4'>
        {Object.entries(deploySteps).map(([key, value], index) => (
          <div className='flex items-center gap-4' key={key}>
            <div
              className={cn(
                'flex size-11 items-center justify-center rounded-full border-2 border-gray-300 bg-transparent',
                deployStatus[key] ? 'border-functional-link-primary bg-functional-link-primary' : '',
              )}
            >
              {deployStatus[key] ? <Check className='h-5 w-5 text-white' /> : index + 1}
            </div>

            <div key={key} className='flex flex-col gap-1'>
              <h3 className='font-medium'>{value.title}</h3>
              <p className='text-sm text-black/60'>{value.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export { Deploy };
