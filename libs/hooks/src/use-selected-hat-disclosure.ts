import { hatIdDecimalToIp, hatIdHexToDecimal } from '@hatsprotocol/sdk-v1-core';
import { useCallback, useState } from 'react';
import { SupportedChains } from 'types';
import { Hex } from 'viem';

/**
 * Custom hook to manage the disclosure of the selected hat
 * @returns `isOpen` - boolean value to determine if the hat is open
 * @returns `onOpen` - function to open the hat, passing the hatId
 * @returns `onClose` - function to close the hat
 */
const useSelectedHatDisclosure = ({
  chainId,
  treeId,
}: {
  chainId: SupportedChains | undefined;
  treeId: number | undefined;
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const onOpen = useCallback(
    (localHatId: Hex) => {
      setIsOpen(true);

      window.history.pushState(
        {},
        '',
        `/trees/${chainId}/${treeId}?hatId=${hatIdDecimalToIp(hatIdHexToDecimal(localHatId))}`,
      );
    },
    [chainId, treeId],
  );

  const onClose = useCallback(() => {
    setIsOpen(false);

    window.history.pushState({}, '', `/trees/${chainId}/${treeId}`);
  }, [chainId, treeId]);

  return { isOpen, onOpen, onClose };
};

export { useSelectedHatDisclosure };
