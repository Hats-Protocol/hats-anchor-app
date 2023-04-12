import { useEffect, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { pinImage, unpinImage } from '../lib/ipfs';

const usePinImageIpfs = ({ imageFile, enabled, metadata }) => {
  const [currentImageFile, setCurrentImageFile] = useState();
  const [currentImageCid, setCurrentImageCid] = useState();

  const { data, isLoading, error, mutateAsync } = useMutation({
    mutationFn: pinImage,
  });

  useEffect(() => {
    const pin = async (imageFile) => {
      let cid = await mutateAsync({ file: imageFile, metadata });
      if (cid !== undefined) {
        setCurrentImageFile(imageFile);
        if (currentImageCid !== undefined && cid != currentImageCid) {
          unpinImage(currentImageCid);
        }
        setCurrentImageCid(cid);
      }
    };

    if (imageFile !== undefined && imageFile != currentImageFile && enabled) {
      pin(imageFile);
    }
  }, [imageFile]);

  return {
    data: data,
    isLoading: isLoading,
    error: error,
  };
};

export default usePinImageIpfs;
