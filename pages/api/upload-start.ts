import _ from 'lodash';
import { NextApiRequest, NextApiResponse } from 'next';

const date = new Date();

// TODO handle distinguishing between file and json tokens
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

// TODO move type
type KeyRestrictions = {
  keyName: string;
  maxUses: number;
  permissions: {
    endpoints: {
      data: {
        pinList: boolean;
        userPinnedDataTotal: boolean;
      };
      pinning: {
        pinFileToIPFS: boolean;
        pinJSONToIPFS: boolean;
        pinJobs: boolean;
        unpin: boolean;
        userPinPolicy: boolean;
      };
    };
  };
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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  const count = _.get(req, 'body.count');
  if (_.gt(_.toNumber(count), 0)) {
    keyRestrictions.maxUses = _.gt(count, 20) ? 20 : count;
  }

  try {
    const apiKey = await generateApiKey(keyRestrictions);
    res.send(apiKey);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log(e);
    res.status(500).send('Server Error');
  }
}
