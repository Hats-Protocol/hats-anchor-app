import axios from 'axios';

const PINATA_JWT =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiIyYTEzMjFjYi03Y2VjLTQzNDQtYTU0Yi0zNjE3Y2E2Y2UzNjgiLCJlbWFpbCI6ImdlcnNoaWRvQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImlkIjoiRlJBMSIsImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxfSx7ImlkIjoiTllDMSIsImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxfV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiIxZGNkYTlhZDcxNmJiY2VkYmUwMCIsInNjb3BlZEtleVNlY3JldCI6ImE1NGM0Njk5MzhkOGFiZDBiYjQyNmEwNGE3Njc1NDBjYjExMGNjOGZmNWQ3OWQ4N2Y2NzdjYWE5NWVhZTMzYjgiLCJpYXQiOjE2ODA4MDY0MDZ9.rdPqf2iVlCT3rN9lJojaFlqu5yhGofcTgllrFVfigQ0';

export const pinJson = async (data) => {
  const pinataData = JSON.stringify({
    pinataOptions: {
      cidVersion: 1,
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

export const pinImage = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const metadata = JSON.stringify({
    name: file.name,
  });
  formData.append('pinataMetadata', metadata);

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
        //'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
        Authorization: `Bearer ${PINATA_JWT}`,
      },
    },
  );
  console.log(res);
  return res.data.IpfsHash;
};

export const unpinImage = async (cid) => {
  let config = {
    method: 'delete',
    url: `https://api.pinata.cloud/pinning/unpin/${cid}`,
    headers: {
      Authorization: `Bearer ${PINATA_JWT}`,
    },
  };

  const res = await axios(config);
  console.log('upnin res:', res);
};
