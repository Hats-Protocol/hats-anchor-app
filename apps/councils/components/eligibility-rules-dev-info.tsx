import { ModuleParameter, Ruleset } from '@hatsprotocol/modules-sdk';
import { hatIdDecimalToHex, hatIdDecimalToIp } from '@hatsprotocol/sdk-v1-core';
import { flatten, last, map } from 'lodash';
import { ChakraNextLink } from 'ui';
import { explorerUrl, formatAddress, hatLink, ipfsUrl, shortDateFormatter } from 'utils';

const ModuleParamDisplay = ({ param, chainId }: { param: ModuleParameter; chainId: number }) => {
  if (param.displayType === 'hat') {
    return (
      <div key={param.label}>
        <span className='text-sm'>{param.label}</span> -{' '}
        <ChakraNextLink
          href={hatLink({ chainId, hatId: hatIdDecimalToHex(param.value as bigint) })}
          isExternal
          decoration
        >
          {hatIdDecimalToIp(param.value as bigint)}
        </ChakraNextLink>
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
        <ChakraNextLink href={localValue} isExternal decoration>
          {(param.value as string).slice(0, 20)}...
        </ChakraNextLink>
      </div>
    );
  }

  return (
    <div key={param.label}>
      {param.label} - {localValue}
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

              <ChakraNextLink href={`${explorerUrl(chainId)}/address/${rule.address}`} isExternal decoration>
                {formatAddress(rule.address)}
              </ChakraNextLink>
            </div>

            <ModuleParamsDevDisplay params={rule.liveParams} chainId={chainId} moduleId={rule.address} />

            <hr />
          </div>
        );
      })}
    </div>
  );
}
