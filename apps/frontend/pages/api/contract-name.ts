import { SupportedChains } from 'hats-types';
import _ from 'lodash';
import { NextApiRequest, NextApiResponse } from 'next';

const {
  ETHERSCAN_API_KEY,
  OPSCAN_API_KEY,
  POLYGONSCAN_API_KEY,
  GNOSISSCAN_API_KEY,
  ARBISCAN_API_KEY,
  BASESCAN_API_KEY,
  CELOSCAN_API_KEY,
} = process.env;

const ETHERSCAN_API_URLS: { [key in SupportedChains]: string | undefined } = {
  1: 'https://api.etherscan.io/api',
  10: 'https://api-optimistic.etherscan.io/api',
  100: 'https://api.gnosisscan.io/api',
  137: 'https://api.polygonscan.com/api',
  8453: 'https://api.basescan.org/api',
  42161: 'https://api.arbiscan.io/api',
  42220: 'https://api.celoscan.io/api',
  11155111: 'https://api-sepolia.etherscan.io/api',
};

const ETHERSCAN_KEYS: { [key in SupportedChains]: string | undefined } = {
  1: ETHERSCAN_API_KEY,
  10: OPSCAN_API_KEY,
  100: GNOSISSCAN_API_KEY,
  137: POLYGONSCAN_API_KEY,
  8453: BASESCAN_API_KEY,
  42161: ARBISCAN_API_KEY,
  42220: CELOSCAN_API_KEY,
  11155111: ETHERSCAN_API_KEY,
};

const ContractName = async (req: NextApiRequest, res: NextApiResponse) => {
  const { chainId, address } = req.body;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!chainId || !address) {
    return res.status(400).json({ error: 'Missing chainId or address' });
  }

  // TODO more auth, do fetch requests pass next session?
  if (
    !ETHERSCAN_API_URLS[chainId as SupportedChains] ||
    !ETHERSCAN_KEYS[chainId as SupportedChains]
  ) {
    return res.status(400).json({ error: 'Chain not supported' });
  }

  try {
    const result = await fetch(
      `${
        ETHERSCAN_API_URLS[chainId as SupportedChains]
      }?module=contract&action=getsourcecode&address=${address}&apikey=${
        ETHERSCAN_KEYS[chainId as SupportedChains]
      }`,
    );
    const data = await result.json();
    // force error if not verified
    if (_.get(data, 'result[0].ABI') === 'Contract source code not verified') {
      return res.status(404).json({ error: 'Contract not verified', address });
    }
    const returnData = _.mapKeys(
      _.get(data, 'result[0]'),
      (value: unknown, key: string) => _.camelCase(key),
    );
    const trimData = _.omit(returnData, ['abi', 'sourceCode']);

    return res.status(201).json(trimData);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log(error);
    return res.status(500).json({ error });
  }
};

export default ContractName;
