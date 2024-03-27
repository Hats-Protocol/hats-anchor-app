import { useRouter } from 'next/router';
import { useCallback, useEffect, useState } from 'react';
import { getQueryRoute } from 'utils';
import { Hex } from 'viem';

/**
 * Custom hook to manage the disclosure of the selected hat
 * @returns isOpen - boolean value to determine if the hat is open
 * @returns onOpen - function to open the hat, passing the hatId
 * @returns onClose - function to close the hat
 */
const useSelectedHatDisclosure = (hatId: Hex | undefined) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [initialLoad, setInitialLoad] = useState<boolean>(true);
  const router = useRouter();
  console.log('useSelectedHatDisclosure', hatId);

  const onOpen = useCallback(
    (localHatId: Hex) => {
      console.log('here');
      setIsOpen(true);

      const updatedUrl = getQueryRoute({
        query: router.query,
        pathname: router.pathname,
        hatId: localHatId,
      });
      router.push(updatedUrl);
    },
    [router],
  );

  const onClose = useCallback(() => {
    setIsOpen(false);
    console.log('there');
    const updatedUrl = getQueryRoute({
      query: router.query,
      pathname: router.pathname,
      drop: { hat: true },
    });
    router.push(updatedUrl);
  }, [router]);

  useEffect(() => {
    if (initialLoad && hatId) {
      onOpen(hatId);
      setInitialLoad(false);
    }
  }, [hatId, initialLoad]);

  return { isOpen, onOpen, onClose };
};

export default useSelectedHatDisclosure;
