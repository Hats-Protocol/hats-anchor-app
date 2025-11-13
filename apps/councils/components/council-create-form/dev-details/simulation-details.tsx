'use client';

import { MULTICALL3_ADDRESS, TENDERLY_SIMULATION_URL, ZODIAC_MODULE_PROXY_FACTORY_ADDRESS } from '@hatsprotocol/config';
import { HATS_V1 } from '@hatsprotocol/sdk-v1-core';
import { useCouncilForm } from 'contexts';
import { useSimulateTransaction } from 'hooks';
import { compact, get, pick } from 'lodash';
import { DevInfo } from 'molecules';
import { BaseTextarea, Button, Link } from 'ui';
import { explorerUrl, formatAddress } from 'utils';
import { zeroAddress } from 'viem';
import { useAccount, UseSimulateContractReturnType } from 'wagmi';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SimulateResult = UseSimulateContractReturnType<any, any, any, any, any, any>;

// TODO attempt to parse results
// const HATS_CONFIG = {
//   address: HATS_V1,
//   abi: HATS_ABI,
//   eventName: 'HatCreated',
// };

// const MODULES_CONFIG = {
//   address: CONFIG.modules.factoryV7,
//   abi: HATS_MODULES_FACTORY_ABI,
//   eventName: 'HatsModuleFactory_ModuleDeployed',
// };

const hsgResult = (hsgResult: { chainId: number; result: string }) => {
  const { chainId, result } = pick(hsgResult, ['chainId', 'result']);
  return (
    <p className='text-sm'>
      <Link href={explorerUrl(chainId) + '/address/' + result} isExternal>
        {formatAddress(result)}
      </Link>
    </p>
  );
};

const SimulateStatus = ({
  simulate,
  chainId,
  callData,
  to,
  resultFn,
}: {
  simulate: SimulateResult | undefined;
  chainId: number;
  callData: string | undefined;
  to: string | undefined;
  resultFn?: (result: { chainId: number; result: string }) => React.ReactNode;
}) => {
  const { address } = useAccount();
  const { simulationResponse, isSimulating, handleSimulate } = useSimulateTransaction({
    chainId,
    callData,
    to,
  });

  return (
    <div className='flex items-center gap-2'>
      {get(simulationResponse, 'simulation.id') && (
        <Link
          href={TENDERLY_SIMULATION_URL + get(simulationResponse, 'simulation.id')}
          className='underline'
          isExternal
        >
          <p className='text-sm'>View on Tenderly</p>
        </Link>
      )}
      <Button
        variant='outline-blue'
        size='xs'
        disabled={isSimulating || !callData}
        onClick={() => {
          handleSimulate(address || zeroAddress);
        }}
      >
        {isSimulating ? 'Simulating...' : 'Simulate'}
      </Button>

      {resultFn ? (
        resultFn(simulate?.data)
      ) : (
        <p className='text-sm'>{simulate?.data ? 'Success' : simulate?.error ? 'Failed' : ''}</p>
      )}
    </div>
  );
};

const SimulationResult = ({
  simulate,
  title,
  chainId,
  callData,
  to,
  resultFn,
}: {
  simulate: SimulateResult | undefined;
  title?: string;
  chainId: number;
  callData?: string | undefined;
  to?: string | undefined;
  resultFn?: ({ result, chainId }: { result: string; chainId: number }) => React.ReactNode;
}) => {
  if (!simulate?.fetchStatus || (simulate?.fetchStatus === 'idle' && simulate?.status === 'pending')) {
    return null;
  }

  return (
    <DevInfo
      title={title || 'Simulation Result'}
      devInfos={compact([
        {
          label: 'Simulation Status',
          descriptor: (
            <SimulateStatus simulate={simulate} chainId={chainId} callData={callData} to={to} resultFn={resultFn} />
          ),
        },
        simulate?.error && {
          label: 'Simulation Error',
          descriptor: <BaseTextarea className='h-32 w-3/4 text-sm' value={simulate?.error?.message} readOnly />,
        },
      ])}
    />
  );
};

export const SimulationDetails = ({ chainId }: { chainId: number | undefined }) => {
  const {
    deployCouncilCalldata,
    deployHatsCalldata,
    deployHsgCalldata,
    deployMchCalldata,
    simulateCouncil,
    simulateHats,
    simulateHsg,
    simulateMch,
    mchArgs,
    tree,
  } = useCouncilForm();

  const isDev = false || process.env.NODE_ENV === 'development';

  if (!isDev || !chainId) return null;

  return (
    <div>
      <SimulationResult
        simulate={!tree ? simulateCouncil : undefined}
        title='Council Multicall'
        chainId={chainId}
        callData={deployCouncilCalldata}
        to={MULTICALL3_ADDRESS}
      />
      <SimulationResult
        simulate={simulateHats}
        title='Hats'
        chainId={chainId}
        callData={deployHatsCalldata}
        to={HATS_V1}
      />
      <SimulationResult
        simulate={simulateMch}
        title={'Modules & register with existing MCH'}
        chainId={chainId}
        callData={deployMchCalldata}
        to={mchArgs?.existingMch}
      />
      <SimulationResult
        simulate={simulateHsg}
        title='HSG/Safe'
        chainId={chainId}
        callData={deployHsgCalldata}
        to={ZODIAC_MODULE_PROXY_FACTORY_ADDRESS}
        resultFn={hsgResult}
      />
    </div>
  );
};
