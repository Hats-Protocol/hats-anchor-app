// import {
//   ETHERSCAN_API_URLS,
//   ETHERSCAN_KEYS,
//   FALLBACK_ADDRESS,
// } from '@hatsprotocol/constants';
// import _ from 'lodash';
// import { NextApiRequest, NextApiResponse } from 'next';
// import { Hex } from 'viem';

export async function GET(request: Request) {}

// const etherscanUrl = (chainId: number, address: Hex) => {
//   return `${_.get(
//     ETHERSCAN_API_URLS,
//     chainId,
//   )}?module=contract&action=getsourcecode&address=${address}&apikey=${_.get(
//     ETHERSCAN_KEYS,
//     chainId,
//   )}`;
// };

// const fetchContractData = async (chainId: number, address: Hex) =>
//   fetch(etherscanUrl(chainId, address))
//     .then((result) => {
//       if (!result) return undefined;
//       return result.json();
//     })
//     .catch((error) => {
//       throw new Error(error);
//     });

// const ContractName = async (req: NextApiRequest, res: NextApiResponse) => {
//   const { chainId, address } = req.body;

//   if (req.method !== 'POST') {
//     return res.status(405).json({ error: 'Method not allowed' });
//   }

//   if (!chainId || !address) {
//     return res.status(400).json({ error: 'Missing chainId or address' });
//   }

//   // TODO [low] more auth, do fetch requests pass next session?
//   if (!_.has(ETHERSCAN_API_URLS, chainId) || !_.has(ETHERSCAN_KEYS, chainId)) {
//     return res.status(400).json({ error: 'Chain not supported' });
//   }

//   if (_.toLower(address) === FALLBACK_ADDRESS) {
//     return res.status(201).json({ ContractName: 'Fallback Zero' });
//   }

//   try {
//     const data = await fetchContractData(chainId, address);
//     // eslint-disable-next-line no-console
//     // console.log(
//     //   address,
//     //   _.omit(_.get(data, 'result[0]'), ['ABI', 'SourceCode']),
//     // );

//     // force error if not verified
//     if (_.get(data, 'result[0].ABI') === 'Contract source code not verified') {
//       return res.status(404).json({ error: 'Contract not verified', address });
//     }
//     const returnData = _.mapKeys(
//       _.get(data, 'result[0]'),
//       (value: unknown, key: string) => _.camelCase(key),
//     );
//     const trimData = _.omit(returnData, ['abi', 'sourceCode']);

//     return res.status(201).json(trimData);
//   } catch (error) {
//     // eslint-disable-next-line no-console
//     console.log(error);
//     return res.status(500).json({ error });
//   }
// };

// export default ContractName;
