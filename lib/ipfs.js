import axios from 'axios';

export const pinJson = async (data) => {
  let jwt = '';

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
      Authorization: `Bearer ${jwt}`,
    },
    data: pinataData,
  };

  const res = await axios(config);
  console.log('pinned:', { ...data }, 'cid:', res.cid);

  return res;
};

export const pinImage = async (file) => {
  let jwt = '';

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
        'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
        Authorization: `Bearer ${jwt}`,
      },
    },
  );
  console.log(res);
  return res.data.IpfsHash;
};

export const unpinImage = async (cid) => {
  let jwt = '';

  let config = {
    method: 'delete',
    url: `https://api.pinata.cloud/pinning/unpin/${cid}`,
    headers: {
      Authorization: `Bearer ${jwt}`,
    },
  };

  const res = await axios(config);
  console.log('upnin res:', res);
};
