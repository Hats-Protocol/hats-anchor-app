import { useEffect, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { pinImage, unpinCid } from '../lib/ipfs';

/**
 * Pins an image file to ipfs. If image file is updated, then unpins previous and pins updated image
 * @param {File} imageFile the image file to pin
 * @param {boolean} enabled whether the hook should be activated or not
 * @param {object} metadata key-value object with the image metadata, as should be sent to Pinata
 * @returns The CID of the pinned image
 */
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
        // unpin prev image in case the image was updated
        if (currentImageCid !== undefined && cid != currentImageCid) {
          unpinCid(currentImageCid);
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
