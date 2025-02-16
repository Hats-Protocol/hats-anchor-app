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

  // Helper to determine if a step is the current active step
  const isActiveStep = (currentKey: string) => {
    const steps = Object.keys(deploySteps);
    const currentIndex = steps.indexOf(currentKey);
    const previousStep = currentIndex > 0 ? steps[currentIndex - 1] : null;

    // First step is active if it's not complete and no other steps are complete
    if (currentIndex === 0) {
      return !deployStatus[currentKey] && !Object.values(deployStatus).some((status) => status);
    }

    // Other steps are active if previous step is complete but current isn't
    return previousStep ? deployStatus[previousStep] && !deployStatus[currentKey] : false;
  };

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
        {Object.entries(deploySteps).map(([key, value], index, array) => {
          const isActive = isActiveStep(key);
          const isComplete = deployStatus[key];
          const isProcessing = key === 'processTx' && isActive;
          const isLastStep = index === array.length - 1;

          return (
            <div className='flex items-start gap-4' key={key}>
              <div className='flex flex-col items-center'>
                <div
                  className={cn(
                    'relative flex size-11 items-center justify-center rounded-full',
                    isComplete
                      ? 'border-functional-link-primary bg-functional-link-primary border-2'
                      : isActive || isProcessing
                        ? cn('border-2 border-gray-300 bg-sky-100', [
                            'before:absolute before:inset-[-2px] before:animate-[spin_2s_linear_infinite] before:rounded-full',
                            'before:bg-[length:200%_100%]',
                            'before:from-functional-link-primary before:to-functional-link-primary before:bg-gradient-to-r before:via-sky-100 before:via-30%',
                            'after:absolute after:inset-[-1px] after:rounded-full after:bg-sky-100',
                            'border-none',
                          ])
                        : 'border-2 border-gray-300',
                  )}
                >
                  {isComplete ? (
                    <Check className='h-5 w-5 text-white' />
                  ) : (
                    <span className='relative z-10'>{index + 1}</span>
                  )}
                </div>

                {!isLastStep && (
                  <div className={cn('my-2 h-3 w-[2px]', isComplete ? 'bg-functional-link-primary' : 'bg-gray-200')} />
                )}
              </div>

              <div className='flex flex-col gap-1'>
                <h3 className='font-medium'>{value.title}</h3>
                <p className='text-sm text-black/60'>{value.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export { Deploy };
