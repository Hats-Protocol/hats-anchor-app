import { useRouter } from 'next/router';
import { useCallback, useState } from 'react';
import { getQueryRoute } from 'utils';
import { Hex } from 'viem';

/**
 * Custom hook to manage the disclosure of the selected hat
 * @returns isOpen - boolean value to determine if the hat is open
 * @returns onOpen - function to open the hat, passing the hatId
 * @returns onClose - function to close the hat
 */
const useSelectedHatDisclosure = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const router = useRouter();

  const onOpen = useCallback(
    (hatId: Hex) => {
      console.log('here');
      setIsOpen(true);

      const updatedUrl = getQueryRoute({
        query: router.query,
        pathname: router.pathname,
        hatId,
      });
      router.push(updatedUrl, undefined, { shallow: true });
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
    router.push(updatedUrl, undefined, { shallow: true });
  }, [router]);

  return { isOpen, onOpen, onClose };
};

export default useSelectedHatDisclosure;
