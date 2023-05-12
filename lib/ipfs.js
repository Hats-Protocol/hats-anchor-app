import axios from 'axios';

const PINATA_JWT = process.env.NEXT_PUBLIC_PINATA_JWT;

export const PINATA_GATEWAY_TOKEN =
  process.env.NEXT_PUBLIC_PINATA_GATEWAY_TOKEN;

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

  return res.data.IpfsHash;
};

export const unpinCid = async (cid) => {
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

export const createGuild = async (chainId, treeId, guildName) => {
  try {
    await pinJson(
      {
        type: '1.0',
      },
      {
        name: `network_${chainId}_treeId_${treeId}`,
        keyvalues: { guildName },
      },
    );
  } catch (error) {
    console.error('Error fetching data:', error.message);
  }
};

export const fetchGuild = async (chainId, treeId) => {
  const queryParams = `metadata[name]=network_${chainId}_treeId_${treeId}`;

  const config = {
    method: 'get',
    url: `https://api.pinata.cloud/data/pinList?${queryParams}`,
    headers: {
      Authorization: `Bearer ${PINATA_JWT}`,
    },
  };

  try {
    const response = await axios(config);
    const pinnedObjects = response.data.rows;

    return pinnedObjects;
  } catch (error) {
    console.error('Error searching for Guilds:', error.message);
    return [];
  }
};

export const updateGuild = async (chainId, treeId, guildName) => {
  try {
    const pinnedObjects = await fetchGuild(chainId, treeId);

    // Find the latest pinned object
    const objectToUpdate = pinnedObjects[0];

    if (!objectToUpdate) {
      console.log('Associated guild not found.');
      return;
    }

    const data = JSON.stringify({
      name: `network_${chainId}_treeId_${treeId}`,
      keyvalues: { guildName },
      ipfsPinHash: objectToUpdate.ipfs_pin_hash,
    });

    const config = {
      method: 'put',
      url: 'https://api.pinata.cloud/pinning/hashMetadata',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${PINATA_JWT}`,
      },
      data,
    };

    await axios(config);
  } catch (error) {
    console.error('Error fetching data:', error.message);
  }
};

export const deleteGuild = async (chainId, treeId) => {
  try {
    const pinnedObjects = await fetchGuild(chainId, treeId);

    // Find the latest pinned object
    const objectToDelete = pinnedObjects[0];

    if (!objectToDelete) {
      return;
    }

    await unpinCid(objectToDelete.ipfs_pin_hash);
  } catch (error) {
    console.error('Error deleting associated guild:', error.message);
  }
};
