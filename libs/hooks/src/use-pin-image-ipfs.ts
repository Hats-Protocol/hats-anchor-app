import { useMutation } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { fetchToken, pinImage, unpinImage } from 'utils';

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
  setLoading,
}: {
  imageFile: File;
  enabled: boolean;
  metadata: object;
  setLoading?: (loading: boolean) => void;
}) => {
  const [currentImageFile, setCurrentImageFile] = useState<File>();
  const [currentImageCid, setCurrentImageCid] = useState();

  const {
    data,
    error,
    mutateAsync: pinImageAsync,
  } = useMutation({
    mutationFn: pinImage,
  });

  useEffect(() => {
    const pin = async (file: File) => {
      setLoading?.(true);
      const token = await fetchToken();
      const cid = await pinImageAsync({ file, metadata, token });
      if (cid !== undefined) {
        setCurrentImageFile(file);
        // unpin prev image in case the image was updated
        if (currentImageCid !== undefined && cid !== currentImageCid) {
          unpinImage(currentImageCid, token);
        }
        setCurrentImageCid(cid);
      }
      setLoading?.(false);
    };

    if (imageFile !== undefined && imageFile !== currentImageFile && enabled) {
      pin(imageFile);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageFile]);

  return {
    data,
    error,
  };
};

export { usePinImageIpfs };
