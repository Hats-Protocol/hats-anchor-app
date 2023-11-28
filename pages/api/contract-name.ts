import _ from 'lodash';
import { NextApiRequest, NextApiResponse } from 'next';

const ETHERSCAN_API_URLS: { [key: number]: string } = {
  1: 'https://api.etherscan.io/api',
  5: 'https://api-goerli.etherscan.io/api',
  10: 'https://api-optimistic.etherscan.io/api',
  100: 'https://api.gnosisscan.io/api',
  137: 'https://api.polygonscan.com/api',
  42151: 'https://api.arbiscan.io/api',
};

const { ETHERSCAN_API_KEY } = process.env;

const ContractName = async (req: NextApiRequest, res: NextApiResponse) => {
  const { chainId, address } = req.body;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!chainId || !address) {
    return res.status(400).json({ error: 'Missing chainId or address' });
  }

  // TODO more auth, simple fetch requests passes next session?

  try {
    const result = await fetch(
      `${ETHERSCAN_API_URLS[chainId]}?module=contract&action=getsourcecode&address=${address}&apikey=${ETHERSCAN_API_KEY}`,
    );
    const data = await result.json();
    const returnData = _.mapKeys(_.get(data, 'result[0]'), (value, key) =>
      _.camelCase(key),
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
