'use client';

import { TENDERLY_SIMULATION_URL } from '@hatsprotocol/config';
import { hatIdDecimalToIp, hatIdHexToDecimal, HATS_V1 } from '@hatsprotocol/sdk-v1-core';
import { useTreeForm } from 'contexts';
import { useMulticallCallData } from 'hats-hooks';
import { editHasUpdates } from 'hats-utils';
import { useClipboard, useSimulateTransaction } from 'hooks';
import { get, isEmpty, keys, map } from 'lodash';
import posthog from 'posthog-js';
import { useCallback } from 'react';
import { AiOutlineInfoCircle } from 'react-icons/ai';
import { FiCopy } from 'react-icons/fi';
import { IoIosArrowUp } from 'react-icons/io';
import { AppHat } from 'types';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  BaseInput as Input,
  Button,
  cn,
  Link,
  Spinner,
  Tooltip,
} from 'ui';
import { logger } from 'utils';
import { useAccount } from 'wagmi';

const CALLDATA_TOOLTIP_COPY =
  'To deploy these changes from a multisig or DAO, create a new transaction using a transaction builder, switch to raw/custom data, and copy this into the "Data (Hex encoded)" field.';

const BottomMenu = ({
  isExpanded,
  setAccordionIndex,
}: {
  isExpanded: boolean;
  setAccordionIndex: (index: string[]) => void;
}) => {
  const { storedData, chainId, treeId, onchainHats, treeToDisplay, topHat } = useTreeForm();
  const { address } = useAccount();
  const { data: multicallData, isLoading } = useMulticallCallData({
    chainId,
    treeId,
    storedData,
    onchainHats,
    treeToDisplay,
    isExpanded,
  });
  const callData = get(multicallData, 'callData.callData', null);
  const allCalls = get(multicallData, 'allCalls', []);
  const topHatWearer = get(topHat, 'wearers.0.id');

  const hasUpdates = editHasUpdates(storedData);

  const { onCopy: copyCallData } = useClipboard(callData || '', {
    toastData: { title: 'Successfully copied hex code to clipboard' },
  });
  const { onCopy: copyContractAddress } = useClipboard(HATS_V1, {
    toastData: {
      title: 'Successfully copied contract address to clipboard',
      // status: 'info',
    },
  });
  const { handleSimulate, isSimulating, simulationResponse } = useSimulateTransaction({
    chainId,
    callData: callData || undefined,
  });

  const openCalldataMenu = () => {
    posthog.capture('Opened Transaction Calldata Menu');
    setAccordionIndex(isExpanded ? [] : ['bottom-menu']);
  };

  const enableSimulation = posthog.isFeatureEnabled('simulation') || process.env.NODE_ENV !== 'production';

  const handleSimulateTopHat = useCallback(() => {
    if (!topHatWearer) return;
    handleSimulate(topHatWearer);
  }, [handleSimulate, topHatWearer]);

  const handleSimulateMe = useCallback(() => {
    if (!address) return;

    handleSimulate(address);
  }, [handleSimulate, address]);

  const isDev = posthog.isFeatureEnabled('dev') || process.env.NODE_ENV !== 'production';
  logger.debug('tree drawer bottom menu', { allCalls });

  return (
    <div className='z-14 absolute bottom-0 w-full'>
      <div className='flex justify-between border-t border-gray-200 bg-cyan-50'>
        <Accordion
          type='single'
          className='mt-[-1px] w-full'
          collapsible
          value={isExpanded ? 'bottom-menu' : ''}
          disabled={!hasUpdates}
        >
          <AccordionItem value='bottom-menu' aria-disabled={!hasUpdates}>
            <AccordionTrigger
              className={cn('px-8 py-4 hover:no-underline', !hasUpdates && 'opacity-50')}
              onClick={openCalldataMenu}
              customIcon={<IoIosArrowUp className='transition-transform duration-200' />}
            >
              <div className='text-base font-normal'>Transaction Call Data</div>
            </AccordionTrigger>

            <AccordionContent className='px-8 pb-8'>
              <div className='flex flex-col gap-2'>
                {isDev && (
                  <>
                    <div className='max-h-[250px] space-y-2 overflow-auto'>
                      <h3 className='text-sm font-medium'>Combined Call Data</h3>

                      {map(
                        allCalls,
                        (hat: { hatChanges: AppHat; calls: { functionName: string }[]; hatId: string }) => {
                          if (isEmpty(keys(hat.hatChanges))) return null;
                          const hatId = hat.hatChanges.id || hat.hatId;
                          return (
                            <div className='flex flex-col gap-1' key={hatId}>
                              <h3 className='text-sm font-medium'>{hatIdDecimalToIp(hatIdHexToDecimal(hatId))}</h3>
                              {map(hat.calls, (call) => (
                                <p className='text-sm'>-- {call.functionName}</p>
                              ))}
                            </div>
                          );
                        },
                      )}
                    </div>

                    <div className='border-t border-gray-400' />
                  </>
                )}

                {enableSimulation && (
                  <>
                    <div className='my-2 flex flex-col gap-1'>
                      <p className='text-sm font-light'>Simulate transaction</p>

                      <div className='flex gap-2'>
                        <Button
                          size='sm'
                          variant='outline-blue'
                          disabled={!callData || isSimulating}
                          onClick={handleSimulateMe}
                        >
                          {isSimulating ? 'Simulating...' : 'Simulate Me'}
                        </Button>

                        <Button
                          size='sm'
                          variant='outline-blue'
                          disabled={!callData || isSimulating}
                          onClick={handleSimulateTopHat}
                        >
                          {isSimulating ? 'Simulating...' : 'Simulate Top Hat'}
                        </Button>

                        {!!simulationResponse && (
                          <div className='flex gap-2'>
                            <p className='text-sm'>
                              {get(simulationResponse, 'transaction.status')
                                ? 'Simulation successful!'
                                : 'Simulation failed!'}
                            </p>

                            <Link
                              href={TENDERLY_SIMULATION_URL + get(simulationResponse, 'simulation.id')}
                              className='underline'
                              isExternal
                            >
                              <p className='text-sm'>View on Tenderly</p>
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className='border-t border-gray-400' />
                  </>
                )}

                <div className='flex flex-col gap-1'>
                  <p className='text-sm font-light'>Hats contract address</p>

                  <div className='flex gap-4'>
                    <Input value={HATS_V1} className='text-blackAlpha-600 bg-white' readOnly placeholder='Loading...' />
                    <Button onClick={copyContractAddress} variant='outline' className='border-gray-300'>
                      Copy
                      <FiCopy className='ml-1 size-4' />
                    </Button>
                  </div>
                </div>

                <div className='flex items-center gap-1'>
                  <p className='text-sm font-light'>Transaction call data (hex encoded)</p>
                  <Tooltip label={CALLDATA_TOOLTIP_COPY}>
                    <div className='flex h-5 items-center'>
                      <AiOutlineInfoCircle className='text-black/70' />
                    </div>
                  </Tooltip>
                </div>

                {!isLoading ? (
                  <div className='flex gap-4'>
                    <Input value={isLoading ? '' : callData || ''} readOnly placeholder='Loading...' />
                    <Button onClick={copyCallData} disabled={!callData} variant='outline' className='border-gray-300'>
                      Copy
                      <FiCopy className='ml-1 size-4' />
                    </Button>
                  </div>
                ) : (
                  <div className='flex items-center justify-center'>
                    <Spinner />
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
};

export { BottomMenu };
