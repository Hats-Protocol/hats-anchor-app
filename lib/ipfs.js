import axios from 'axios';

const PINATA_JWT = process.env.NEXT_PUBLIC_PINATA_JWT;

export const pinJson = async (data, metadata) => {
  const pinataData = JSON.stringify({
    pinataOptions: {
      cidVersion: 1,
    },
    pinataMetadata: {
      ...metadata,
    },
    pinataContent: {
      ...data,
    },
  });

  const config = {
    method: 'post',
    url: 'https://api.pinata.cloud/pinning/pinJSONToIPFS',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${PINATA_JWT}`,
    },
    data: pinataData,
  };

  const res = await axios(config);
  console.log('pinned:', { ...data }, 'cid:', res.cid);

  return res;
};

export const pinImage = async ({ file, metadata }) => {
  const formData = new FormData();
  formData.append('file', file);

  formData.append('pinataMetadata', JSON.stringify(metadata));

  const options = JSON.stringify({
    cidVersion: 1,
  });
  formData.append('pinataOptions', options);

  const res = await axios.post(
    'https://api.pinata.cloud/pinning/pinFileToIPFS',
    formData,
    {
      maxBodyLength: 'Infinity',
      headers: {
        Authorization: `Bearer ${PINATA_JWT}`,
      },
    },
  );
  console.log(res);
  return res.data.IpfsHash;
};

export const unpinImage = async (cid) => {
  const config = {
    method: 'delete',
    url: `https://api.pinata.cloud/pinning/unpin/${cid}`,
    headers: {
      Authorization: `Bearer ${PINATA_JWT}`,
    },
  };

  const res = await axios(config);
  console.log('upnin res:', res);
};
