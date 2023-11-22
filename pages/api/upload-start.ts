import { NextApiRequest, NextApiResponse } from 'next';

const date = new Date();

// TODO handle distinguishing between file and json tokens
export const PIN_TYPE = {
  FILE: 'FILE',
  JSON: 'JSON',
};

const { PINATA_JWT } = process.env;

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
  if (req.method === 'POST') {
    const data = req.body;

    if (data.count > 0) {
      keyRestrictions.maxUses = data.count > 20 ? 20 : data.count;
    }

    try {
      const options = {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'content-type': 'application/json',
          authorization: `Bearer ${PINATA_JWT}`,
        },
        body: JSON.stringify(keyRestrictions),
      };

      const jwtResponse = await fetch(
        'https://api.pinata.cloud/users/generateApiKey',
        options,
      );
      const json = await jwtResponse.json();
      const { JWT } = json;
      res.send(JWT);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log(e);
      res.status(500).send('Server Error');
    }
  } else {
    res.status(405).send('Method Not Allowed');
  }
}
