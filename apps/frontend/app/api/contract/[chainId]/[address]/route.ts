import {
  ETHERSCAN_API_URLS,
  ETHERSCAN_KEYS,
  FALLBACK_ADDRESS,
} from '@hatsprotocol/constants';
import _ from 'lodash';
import { Hex } from 'viem';

const etherscanUrl = (chainId: number, address: Hex) => {
  return `${_.get(
    ETHERSCAN_API_URLS,
    chainId,
  )}?module=contract&action=getsourcecode&address=${address}&apikey=${_.get(
    ETHERSCAN_KEYS,
    chainId,
  )}`;
};

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
export async function GET(
  request: Request,
  { params }: { params: { chainId: string; address: Hex } },
) {
  const { chainId: initialChainId, address } = _.pick(params, [
    'chainId',
    'address',
  ]);
  const chainId = _.toNumber(initialChainId);

  if (!chainId || !address) {
    return Response.json(
      { error: 'Missing chainId or address' },
      { status: 400 },
    );
  }

  // TODO [low] more auth, do fetch requests pass next session?
  if (!_.has(ETHERSCAN_API_URLS, chainId) || !_.has(ETHERSCAN_KEYS, chainId)) {
    return Response.json({ error: 'Chain not supported' }, { status: 400 });
  }

  if (_.toLower(address) === FALLBACK_ADDRESS) {
    return Response.json({ ContractName: 'Fallback Zero' }, { status: 201 });
  }

  try {
    const data = await fetchContractData(chainId, address);
    // eslint-disable-next-line no-console
    // console.log(
    //   address,
    //   _.omit(_.get(data, 'result[0]'), ['ABI', 'SourceCode']),
    // );

    // force error if not verified
    if (_.get(data, 'result[0].ABI') === 'Contract source code not verified') {
      return Response.json(
        { error: 'Contract not verified', address },
        { status: 404 },
      );
    }
    const returnData = _.mapKeys(
      _.get(data, 'result[0]'),
      (value: unknown, key: string) => _.camelCase(key),
    );
    const trimData = _.omit(returnData, ['abi', 'sourceCode']);

    return Response.json(trimData, { status: 201 });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log(error);
    return Response.json({ error }, { status: 500 });
  }
}
