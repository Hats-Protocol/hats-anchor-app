import { useQuery } from '@tanstack/react-query';
import { AppHat } from 'hats-types';
import { checkImageIsValid } from 'hats-utils';
import _ from 'lodash';

const getAncestors = (hat: AppHat, hats: AppHat[]) => {
  const ancestors = [];
  let currentHat = hat;
  while (currentHat.admin?.id) {
    if (currentHat.admin?.id === currentHat.id) break;
    const parent = _.find(hats, { id: currentHat.admin?.id });
    if (parent) {
      ancestors.push(parent);
      currentHat = parent;
    } else {
      break;
    }
  }
  return ancestors;
};

const treeImages = async (
  images: string[] | undefined,
  hats: AppHat[] | undefined,
) => {
  if (!images || !hats) return [];

  const promises = _.map(images, (image: string) =>
    checkImageIsValid(image).catch((e) => {}),
  );
  const imageUrls = await Promise.all(promises);

  // iterate through the hats in the tree and assign one of hat images based on ancestry
  const hatsWithImages = _.map(hats, (hat: AppHat) => {
    const ancestry = getAncestors(hat, hats);
    const image = _.find(ancestry, (h: AppHat) => h.imageUri !== '');
    // get image url from ancestor
    const imageIndex = _.findIndex(
      images,
      (v: string) => v === image?.imageUri,
    );
    const imageUrl = imageUrls[imageIndex] || '/icon.jpeg';
    return { ...hat, imageUrl };
  });

  return hatsWithImages;
};

const useTreeImages = ({
  hats,
  editMode,
}: {
  hats: AppHat[] | undefined;
  editMode?: boolean;
}) => {
  const images = _.uniq(_.map(hats, 'imageUri'));
  const actualImages = _.filter(images, (image: string) => image !== '');

  const { data, isLoading, error } = useQuery({
    queryKey: ['treeImages', actualImages, hats],
    queryFn: () => treeImages(actualImages, hats),
    enabled: !!hats,
    staleTime: editMode ? Infinity : 1000 * 60 * 60 * 24,
  });

  return { data, isLoading, error };
};

export default useTreeImages;
