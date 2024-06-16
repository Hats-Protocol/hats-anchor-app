import _ from 'lodash';
import { KeyRestrictions } from 'types';

const date = new Date();

export async function POST(request: Request) {
  const { count } = await request.json();

  if (_.gt(_.toNumber(count), 0)) {
    keyRestrictions.maxUses = _.gt(count, 20) ? 20 : count;
  }

  try {
    const apiKey = await generateApiKey(keyRestrictions);
    Response.json({ apiKey }, { status: 200 });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log(e);
    Response.json({ error: 'Server Error' }, { status: 500 });
  }
}

// TODO [low] handle distinguishing between file and json tokens
export const PIN_TYPE = {
  FILE: 'FILE',
  JSON: 'JSON',
};

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
      // eslint-disable-next-line no-console
      console.log(error);
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
