'use client';

import { useClipboard } from 'hooks';
import { Check, Link, RotateCcw } from 'lucide-react';
import { useMemo } from 'react';
import { Button, cn } from 'ui';

interface DeployStatus {
  [key: string]: boolean;
}

interface DeployStep {
  title: string;
  description: string;
  deployTx?: () => void;
  deployLabel?: string;
}

const firstCouncilDeploySteps: Record<string, DeployStep> = {
  prepareTx: {
    title: 'Preparing transaction',
    description: 'Compiling calldata',
  },
  deployTx: {
    title: 'Waiting for wallet confirmation',
    description: 'You need to confirm and send the transaction',
  },
  confirmTx: {
    title: 'Waiting for blockchain confirmation',
    description: 'Network is including this transaction into a block',
  },
  indexTx: {
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

// Helper to determine if a step is the current active step
const isActiveStep = (deploySteps: Record<string, DeployStep>, deployStatus: DeployStatus, currentKey: string) => {
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

const Deploy = ({
  draftId,
  firstCouncil = true,
  deployStatus,
  // deploy hats is handled prior to hitting this component
  deployModules,
  deployHsg,
}: {
  draftId: string;
  firstCouncil: boolean;
  deployStatus: DeployStatus;
  deployModules: () => void;
  deployHsg: () => void;
}) => {
  const draftUrl = useMemo(() => {
    if (typeof window === 'undefined') return '';
    return `${window.location.origin}/councils/new/payment?draftId=${draftId}`;
  }, [draftId]);
  const { onCopy: copyUrl } = useClipboard(draftUrl, {
    toastData: { variant: 'success', title: 'Copied share link to clipboard' },
  });

  let deploySteps = firstCouncilDeploySteps;
  // technically the txs are not sequential but prefer migrating to batch via 7702 vs handling here
  if (!firstCouncil) {
    deploySteps = {
      prepareTx: {
        title: 'Preparing transaction',
        description: 'Compiling module details, predicting addresses and preparing role updates',
      },
      deployHatsTx: {
        title: 'Deploying roles updates',
        description: 'Confirm the transaction to update the roles',
      },
      confirmHatsTx: {
        title: 'Waiting for blockchain confirmation of roles updates',
        description: 'Network is including this transaction into a block',
      },
      indexHatsTx: {
        title: 'Waiting for indexing of roles updates',
        description: 'Parsing the transaction information for retrieval',
      },
      deployModulesTx: {
        title: 'Deploying modules',
        description: 'Confirm the transaction to deploy the modules',
        deployTx: deployModules,
        deployLabel: 'Deploy Modules',
      },
      confirmModulesTx: {
        title: 'Waiting for confirmation of modules deployment',
        description: 'Network is including this transaction into a block',
      },
      indexModulesTx: {
        title: 'Waiting for indexing of modules deployment',
        description: 'Parsing the transaction information for retrieval',
      },
      deployHsgTx: {
        title: 'Deploying Safe',
        description: 'Confirm the transaction to deploy the Safe',
        deployTx: deployHsg,
        deployLabel: 'Deploy Safe',
      },
      confirmHsgTx: {
        title: 'Waiting for confirmation of Safe deployment',
        description: 'Network is including this transaction into a block',
      },
      indexHsgTx: {
        title: 'Waiting for indexing of Safe deployment',
        description: 'Parsing the transaction information for retrieval',
      },
      processTx: {
        title: 'Processing transaction',
        description: "We're activating your permissions",
      },
      redirect: {
        title: 'Redirecting to the Council',
        description: 'Constructing your Hats Pro control panel and redirecting you to it',
      },
    };
  }

  const isDev = false || process.env.NODE_ENV !== 'production';

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

      <div className='flex flex-col'>
        {Object.entries(deploySteps).map(([key, value], index, array) => {
          const isActive = isActiveStep(deploySteps, deployStatus, key);
          const isComplete = deployStatus[key];
          const isProcessing = key === 'processTx' && isActive;
          const isLastStep = index === array.length - 1;

          return (
            <div className='flex justify-between gap-4' key={key}>
              <div className='flex items-start gap-4'>
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
                    <div
                      className={cn('my-2 h-8 w-[2px]', isComplete ? 'bg-functional-link-primary' : 'bg-gray-200')}
                    />
                  )}
                </div>

                <div className='flex flex-col gap-1'>
                  <h3 className='font-medium'>{value.title}</h3>
                  <p className='text-sm text-black/60'>{value.description}</p>
                </div>
              </div>

              {value.deployTx && (isActiveStep(deploySteps, deployStatus, key) || isDev) && (
                <Button type='button' variant='outline-blue' rounded='full' onClick={value.deployTx}>
                  <RotateCcw className='h-4 w-4' />
                  {value.deployLabel || 'Deploy'}
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export { Deploy };
