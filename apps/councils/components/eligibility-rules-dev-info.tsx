import { ModuleParameter, Ruleset } from '@hatsprotocol/modules-sdk';
import { hatIdDecimalToHex, hatIdDecimalToIp } from '@hatsprotocol/sdk-v1-core';
import { flatten, last, map } from 'lodash';
import { Link } from 'ui';
import { explorerUrl, formatAddress, hatLink, shortDateFormatter } from 'utils';
import { formatEther, formatUnits } from 'viem';

const ModuleParamDisplay = ({ param, chainId }: { param: ModuleParameter; chainId: number }) => {
  if (param.displayType === 'hat') {
    return (
      <div>
        <span className='text-sm'>{param.label}</span> -{' '}
        <Link
          href={hatLink({ chainId, hatId: hatIdDecimalToHex(param.value as bigint) })}
          className='underline'
          isExternal
        >
          {hatIdDecimalToIp(param.value as bigint)}
        </Link>
      </div>
    );
  }
  console.log(param);
  if (param.solidityType === 'address') {
    return (
      <div>
        <span className='text-sm'>{param.label}</span> -{' '}
        <Link href={`${explorerUrl(chainId)}/address/${param.value}`} className='underline' isExternal>
          {formatAddress(param.value as string)}
        </Link>
      </div>
    );
  }
  if (param.solidityType === 'uint256') {
    // TODO handle decimals
    return (
      <div>
        <span className='text-sm'>{param.label}</span> - {formatUnits(param.value as bigint, 6)}
      </div>
    );
  }
  if (param.displayType === 'timestamp') {
    // can assume value is a bigint
    if (param.value === 0n) {
      return (
        <div>
          <span className='text-sm'>{param.label}</span> - Not set
        </div>
      );
    }
    return (
      <div>
        <span className='text-sm'>{param.label}</span> - {shortDateFormatter(new Date(Number(param.value) * 1000))}
      </div>
    );
  }
  let localValue = param.value as string;
  if (typeof localValue === 'string' && localValue.startsWith('ipfs://')) {
    const strippedValue = last(localValue.split('ipfs://'));
    localValue = `https://ipfs.io/ipfs/${strippedValue}`; // `ipfsUrl` pinata gateway is downloading a weird file
    return (
      <div key={param.label}>
        <span className='text-sm'>{param.label}</span> -{' '}
        <Link href={localValue} className='underline' isExternal>
          {(param.value as string).slice(0, 20)}...
        </Link>
      </div>
    );
  }

  return (
    <div key={param.label}>
      <span className='text-sm'>{param.label}</span> - {localValue}
    </div>
  );
};

const ModuleParamsDevDisplay = ({
  moduleId,
  params,
  chainId,
}: {
  moduleId: string;
  params: ModuleParameter[] | undefined;
  chainId: number;
}) => {
  return (
    <div className='flex flex-col items-end gap-1'>
      {map(params, (param) => {
        return <ModuleParamDisplay param={param} chainId={chainId} key={`${moduleId}-${param.label}`} />;
      })}
    </div>
  );
};

export function EligibilityRulesDevInfo({
  chainId,
  eligibilityRules,
}: {
  chainId: number;
  eligibilityRules: Ruleset[] | undefined;
}) {
  if (!eligibilityRules) return null;

  return (
    <div className='flex flex-col gap-2'>
      <h3 className='text-sm font-bold'>Eligibility Rules</h3>

      {map(flatten(eligibilityRules), (rule) => {
        console.log(rule);

        return (
          <div key={rule.address} className='flex flex-col gap-1'>
            <div className='flex justify-between'>
              <div className='text-sm'>{rule.module.name}</div>

              <Link href={`${explorerUrl(chainId)}/address/${rule.address}`} className='underline' isExternal>
                {formatAddress(rule.address)}
              </Link>
            </div>

            <ModuleParamsDevDisplay params={rule.liveParams} chainId={chainId} moduleId={rule.address} />

            <hr />
          </div>
        );
      })}
    </div>
  );
}
