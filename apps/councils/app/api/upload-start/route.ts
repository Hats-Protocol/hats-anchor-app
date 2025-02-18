import { gt, toNumber } from 'lodash';
import { KeyRestrictions } from 'types';
import { logger } from 'utils';

const date = new Date();

const MAX_KEY_USES = 60;

export async function POST(request: Request) {
  const { count } = await request.json();

  if (gt(toNumber(count), 0)) {
    // TODO check on this maximum value
    keyRestrictions.maxUses = gt(count, MAX_KEY_USES) ? MAX_KEY_USES : count;
  }

  try {
    const apiKey = await generateApiKey(keyRestrictions);
    return Response.json({ apiKey }, { status: 200 });
  } catch (error) {
    logger.error(error);

    return Response.json({ error: 'Server Error' }, { status: 500 });
  }
}

// TODO [low] handle distinguishing between file and json tokens
// export const PIN_TYPE = {
//   FILE: 'FILE',
//   JSON: 'JSON',
// };

const { PINATA_JWT } = process.env;

const generateApiKey = async (keyRestrictions: KeyRestrictions) => {
  const options = {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      authorization: `Bearer ${PINATA_JWT}`,
    },
    body: JSON.stringify(keyRestrictions),
  };

  return fetch('https://api.pinata.cloud/users/generateApiKey', options)
    .then((response) => response.json())
    .then((json) => {
      const { JWT } = json;
      return JWT;
    })
    .catch((error) => {
      logger.error(error);
      return null;
    });
};

const keyRestrictions = {
  keyName: `Signed Upload JWT-${date.toISOString()}`,
  maxUses: 2,
  permissions: {
    endpoints: {
      data: {
        pinList: false,
        userPinnedDataTotal: false,
      },
      pinning: {
        pinFileToIPFS: true, // image
        pinJSONToIPFS: true, // json
        pinJobs: false,
        unpin: true, // image (both?)
        userPinPolicy: false,
      },
    },
  },
};
