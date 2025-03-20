import { ETHERSCAN_API_URLS, ETHERSCAN_KEYS } from '@hatsprotocol/config';
import { FALLBACK_ADDRESS } from '@hatsprotocol/constants';
import { camelCase, get, has, mapKeys, omit, pick, toLower, toNumber } from 'lodash';
import { logger } from 'utils';
import { Hex } from 'viem';

const etherscanUrl = (chainId: number, address: Hex) => {
  return `${get(ETHERSCAN_API_URLS, chainId)}?module=contract&action=getsourcecode&address=${address}&apikey=${get(
    ETHERSCAN_KEYS,
    chainId,
  )}`;
};

/**
 * Fetches contract data from Etherscan API
 * @param chainId - The chain ID
 * @param address - The contract address
 * @returns The contract data
 */
const fetchContractData = async (chainId: number, address: Hex) =>
  fetch(etherscanUrl(chainId, address))
    .then((result) => {
      if (!result) return undefined;
      return result.json();
    })
    .catch((error) => {
      throw new Error(error);
    });

// Using GET request so automatically cached via Next
export async function GET(request: Request, { params }: { params: Promise<{ chainId: string; address: Hex }> }) {
  const localParams = await params;
  const { chainId: initialChainId, address } = pick(localParams, ['chainId', 'address']);
  const chainId = toNumber(initialChainId);

  if (!chainId || !address) {
    return Response.json({ error: 'Missing chainId or address' }, { status: 400 });
  }

  // TODO [low] more auth, do fetch requests pass next session?
  if (!has(ETHERSCAN_API_URLS, chainId) || !has(ETHERSCAN_KEYS, chainId)) {
    return Response.json({ error: 'Chain not supported' }, { status: 400 });
  }

  if (toLower(address) === FALLBACK_ADDRESS) {
    return Response.json({ ContractName: 'Fallback Zero' }, { status: 201 });
  }

  try {
    const data = await fetchContractData(chainId, address);
    logger.debug(address, omit(get(data, 'result[0]'), ['ABI', 'SourceCode']));

    // force error if not verified
    if (get(data, 'result[0].ABI') === 'Contract source code not verified') {
      return Response.json({ error: 'Contract not verified', address }, { status: 404 });
    }
    const returnData = mapKeys(get(data, 'result[0]'), (value: unknown, key: string) => camelCase(key));
    const trimData = omit(returnData, ['abi', 'sourceCode']);

    return Response.json(trimData, { status: 201 });
  } catch (error) {
    logger.error(error);
    return Response.json({ error }, { status: 500 });
  }
}
