import { formatImageUrl, isImageUrl } from 'utils';

export const checkImageIsValid = async (img?: string) => {
  const isValidImage = await isImageUrl(formatImageUrl(img));

  if (isValidImage) {
    return formatImageUrl(img);
  }
  return null;
};
