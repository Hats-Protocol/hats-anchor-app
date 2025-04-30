import { TENDERLY_SIMULATION_URL, ZODIAC_MODULE_PROXY_FACTORY_ADDRESS } from '@hatsprotocol/config';
import { HATS_MODULES_FACTORY_ABI, HATS_MODULES_FACTORY_ADDRESS } from '@hatsprotocol/modules-sdk';
import { hatIdDecimalToIp, HATS_ABI, HATS_V1 } from '@hatsprotocol/sdk-v1-core';
import { useCouncilForm } from 'contexts';
import { useSimulateTransaction } from 'hooks';
import { compact, get, map, pick } from 'lodash';
import { DevInfo } from 'molecules';
import posthog from 'posthog-js';
import { useMemo } from 'react';
import { BaseTextarea, Button, Link } from 'ui';
import { explorerUrl, formatAddress } from 'utils';
import { zeroAddress } from 'viem';
import { useAccount, UseSimulateContractReturnType } from 'wagmi';

// TODO attempt to parse results
// const HATS_CONFIG = {
//   address: HATS_V1,
//   abi: HATS_ABI,
//   eventName: 'HatCreated',
// };

// const MODULES_CONFIG = {
//   address: HATS_MODULES_FACTORY_ADDRESS,
//   abi: HATS_MODULES_FACTORY_ABI,
//   eventName: 'HatsModuleFactory_ModuleDeployed',
// };

const hsgResult = (hsgResult: any) => {
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
  simulate: UseSimulateContractReturnType<any, any, any, any, any, any> | undefined;
  chainId: number;
  callData: string | undefined;
  to: string | undefined;
  resultFn?: (result: any) => React.ReactNode;
}) => {
  const { address } = useAccount();
  const {
    simulationResponse: simulateModulesResponse,
    isSimulating: simulateModulesIsSimulating,
    handleSimulate: simulateModulesTx,
  } = useSimulateTransaction({
    chainId,
    callData,
    to,
  });

  return (
    <div className='flex items-center gap-2'>
      {get(simulateModulesResponse, 'simulation.id') && (
        <Link
          href={TENDERLY_SIMULATION_URL + get(simulateModulesResponse, 'simulation.id')}
          className='underline'
          isExternal
        >
          <p className='text-sm'>View on Tenderly</p>
        </Link>
      )}
      <Button
        variant='outline-blue'
        size='xs'
        disabled={simulateModulesIsSimulating || !callData}
        onClick={() => {
          simulateModulesTx(address || zeroAddress);
        }}
      >
        {simulateModulesIsSimulating ? 'Simulating...' : 'Simulate'}
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
  simulate: UseSimulateContractReturnType<any, any, any, any, any, any> | undefined;
  title?: string;
  chainId: number;
  callData?: string | undefined;
  to?: string | undefined;
  resultFn?: ({ result, chainId }: { result: any; chainId: number }) => React.ReactNode;
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
    deployModulesCalldata,
    deployHatsCalldata,
    deployHsgCalldata,
    simulateCouncil,
    simulateHats,
    simulateModules,
    simulateHsg,
  } = useCouncilForm();

  const isDev = posthog.isFeatureEnabled('dev') || process.env.NODE_ENV === 'development';

  if (!isDev) return null;

  return (
    <div>
      <SimulationResult
        simulate={simulateCouncil}
        title='Council Multicall'
        chainId={chainId!}
        // callData={deployModulesCalldata}
        // to={HATS_MODULES_FACTORY_ADDRESS}
      />
      <SimulationResult
        simulate={simulateHats}
        title='Hats'
        chainId={chainId!}
        callData={deployHatsCalldata}
        to={HATS_V1}
      />
      <SimulationResult
        simulate={simulateModules}
        title='Modules'
        chainId={chainId!}
        callData={deployModulesCalldata}
        to={HATS_MODULES_FACTORY_ADDRESS}
      />
      <SimulationResult
        simulate={simulateHsg}
        title='HSG/Safe'
        chainId={chainId!}
        callData={deployHsgCalldata}
        to={ZODIAC_MODULE_PROXY_FACTORY_ADDRESS}
        resultFn={hsgResult}
      />
    </div>
  );
};
