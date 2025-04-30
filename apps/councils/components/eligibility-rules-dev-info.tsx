import { ModuleParameter, Ruleset } from '@hatsprotocol/modules-sdk';
import { hatIdDecimalToHex, hatIdDecimalToIp, hatIdHexToDecimal } from '@hatsprotocol/sdk-v1-core';
import { find, flatten, get, last, map, size } from 'lodash';
import { Link } from 'ui';
import { explorerUrl, formatAddress, hatLink, shortDateFormatter } from 'utils';
import { erc20Abi, formatUnits, Hex } from 'viem';
import { useReadContract } from 'wagmi';

const ModuleParamDisplay = ({
  param,
  chainId,
  tokenDecimals,
}: {
  param: ModuleParameter;
  chainId: number;
  tokenDecimals: number | undefined;
}) => {
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
  // handle timestamp before uint256 since both are bigint
  if (param.solidityType === 'uint256') {
    // decimals passed in from parent
    return (
      <div>
        <span className='text-sm'>{param.label}</span> - {formatUnits(param.value as bigint, tokenDecimals || 18)}
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
  console.log(params);
  const tokenParam = find(params, { displayType: 'erc20' });
  const tokenAddress = tokenParam?.value as Hex;
  console.log(tokenAddress, tokenParam, chainId);
  const {
    data: tokenDecimals,
    status,
    error,
  } = useReadContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: 'decimals',
    chainId,
  });
  console.log(tokenDecimals, status, error);

  return (
    <div className='flex flex-col items-end gap-1'>
      {map(params, (param) => {
        return (
          <ModuleParamDisplay
            param={param}
            chainId={chainId}
            key={`${moduleId}-${param.label}`}
            tokenDecimals={tokenDecimals}
          />
        );
      })}
    </div>
  );
};

export function EligibilityRulesDevInfo({
  hatId,
  chainId,
  eligibilityRules,
  eligibilityAddress,
}: {
  hatId?: string;
  chainId: number;
  eligibilityRules: Ruleset[] | undefined;
  eligibilityAddress: string | undefined;
}) {
  if (!eligibilityRules && eligibilityAddress) {
    return (
      <div className='flex flex-col gap-2'>
        <div className='flex justify-between'>
          <h3 className='text-sm font-medium'>Eligibility Rules</h3>
          <p className='text-sm text-red-500'>Bad eligibility address found!</p>
        </div>
      </div>
    );
  }

  if (!eligibilityRules) return null;

  // TODO technically a chain could wrap a single module/rule, but this is unlikely
  // check address of first rule against eligibility address
  const isSingleRule =
    size(flatten(eligibilityRules)) === 1 && get(flatten(eligibilityRules), '[0].address') === eligibilityAddress;

  return (
    <div className='flex flex-col gap-2'>
      <div className='flex justify-between'>
        <h3 className='text-sm font-medium'>
          Eligibility Rules{hatId ? ` for ${hatIdDecimalToIp(hatIdHexToDecimal(hatId))}` : ''}
        </h3>

        <p className='text-functional-link-secondary text-sm'>
          {!isSingleRule ? `${size(flatten(eligibilityRules))} rules` : 'No chain'}
        </p>
      </div>

      {map(flatten(eligibilityRules), (rule) => {
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
