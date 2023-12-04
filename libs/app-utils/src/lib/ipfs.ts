import { GATEWAY_TOKEN, GATEWAY_URL } from '../constants';

// eslint-disable-next-line import/prefer-default-export
export const ipfsUrl = (hash: string | undefined) => {
  if (!hash) return null;
  return `${GATEWAY_URL}${hash}?pinataGatewayToken=${GATEWAY_TOKEN}`;
};
