import { compact, concat, filter, find, first, get, includes, isEmpty, map, reject, slice } from 'lodash';
import { useCallback, useMemo } from 'react';
import { AppHat, FormData } from 'types';
import { Hex } from 'viem';

const usePendHatterMint = ({
  address,
  hatToMintTo,
  treeToDisplay,
  selectedHat,
  storedData,
  setStoredData,
}: {
  address?: Hex;
  hatToMintTo?: Hex;
  treeToDisplay?: AppHat[];
  selectedHat?: AppHat;
  storedData?: Partial<FormData>[];
  setStoredData?: (v: Partial<FormData>[]) => void;
}) => {
  const availableAdmins = useMemo(() => {
    const noTopHat = slice(treeToDisplay, 1);
    const removeCurrentHat = reject(noTopHat, { id: selectedHat?.id });
    const removeNonLineage = reject(removeCurrentHat, (hat) => !selectedHat?.prettyId?.includes(hat.prettyId || ''));
    // TODO remove hats where current supply = max supply

    return removeNonLineage;
  }, [treeToDisplay, selectedHat]);

  const initialHatToMintTo = useMemo(() => {
    if (!availableAdmins) return undefined;
    return get(first(availableAdmins), 'id');
  }, [availableAdmins]);

  const hatToMintPended = useMemo(() => {
    const pendedWearers = filter(storedData, (h: Partial<FormData>) => includes(map(h.wearers, 'address'), address));
    if (!isEmpty(pendedWearers)) return get(first(pendedWearers), 'id');
    return undefined;
  }, [storedData, address]);

  const localHatToMintTo = useMemo(() => {
    if (hatToMintTo) return hatToMintTo;
    return initialHatToMintTo;
  }, [hatToMintTo, initialHatToMintTo]);

  const pendMintHatForHatter = useCallback(() => {
    if (!address || !localHatToMintTo) return;
    const existingHatToMintTo = find(storedData, ['id', localHatToMintTo]);

    // check for existing wearers
    const existingWearers = existingHatToMintTo?.wearers;
    if (existingHatToMintTo) {
      if (includes(map(existingWearers, 'address'), address)) return;
      const newHatToMintTo = {
        ...existingHatToMintTo,
        wearers: compact(concat(existingWearers, [{ address, ens: '' }])),
      };
      const withoutExisting = reject(storedData, ['id', hatToMintTo]);
      const newData = concat(withoutExisting, [newHatToMintTo]);
      setStoredData?.(newData);
      return;
    }
    setStoredData?.(compact(concat(storedData, [{ id: hatToMintTo, wearers: [{ address, ens: '' }] }])));
    // TODO toast success
  }, [address, hatToMintTo, storedData, setStoredData, localHatToMintTo]);

  return {
    availableAdmins,
    hatToMintTo: localHatToMintTo,
    hatToMintPended,
    pendMintHatForHatter,
  };
};

export { usePendHatterMint };
