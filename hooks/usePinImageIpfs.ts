import { useMutation } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

import { pinImage, unpinImage } from '@/lib/ipfs';

// app-hooks/image-sdk
/**
 * Pins an image file to ipfs. If image file is updated, then unpins previous and pins updated image
 * @param {File} imageFile the image file to pin
 * @param {boolean} enabled whether the hook should be activated or not
 * @param {object} metadata key-value object with the image metadata, as should be sent to Pinata
 * @returns The CID of the pinned image
 */
const usePinImageIpfs = ({
  imageFile,
  enabled,
  metadata,
}: {
  imageFile: File;
  enabled: boolean;
  metadata: object;
}) => {
  const [currentImageFile, setCurrentImageFile] = useState<File>();
  const [currentImageCid, setCurrentImageCid] = useState();

  const { data, isLoading, error, mutateAsync } = useMutation({
    mutationFn: pinImage,
  });

  useEffect(() => {
    const pin = async (i: File) => {
      const cid = await mutateAsync({ file: i, metadata });
      if (cid !== undefined) {
        setCurrentImageFile(i);
        // unpin prev image in case the image was updated
        if (currentImageCid !== undefined && cid !== currentImageCid) {
          unpinImage(currentImageCid);
        }
        setCurrentImageCid(cid);
      }
    };

    if (imageFile !== undefined && imageFile !== currentImageFile && enabled) {
      pin(imageFile);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageFile]);

  return {
    data,
    isLoading,
    error,
  };
};

export default usePinImageIpfs;
