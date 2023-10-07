import _ from 'lodash';
import { useCallback, useMemo } from 'react';
import { Hex } from 'viem';

import { useTreeForm } from '@/contexts/TreeFormContext';

const usePendHatterMint = ({
  address,
  hatToMintTo,
}: {
  address?: Hex;
  hatToMintTo?: Hex;
}) => {
  const { treeToDisplay, selectedHat, storedData, setStoredData } =
    useTreeForm();

  const availableAdmins = useMemo(() => {
    const noTopHat = _.slice(treeToDisplay, 1);
    const removeCurrentHat = _.reject(noTopHat, ['id', selectedHat?.id]);
    // todo remove hats where current supply = max supply
    // todo remove non lineage
    return removeCurrentHat;
  }, [treeToDisplay, selectedHat]);

  const initialHatToMintTo = useMemo(() => {
    if (!availableAdmins) return undefined;
    return _.get(_.first(availableAdmins), 'id');
  }, [availableAdmins]);

  const hatToMintPended = useMemo(() => {
    const pendedWearers = _.filter(storedData, (h) =>
      _.includes(_.map(h.wearers, 'address'), address),
    );
    if (!_.isEmpty(pendedWearers)) return _.get(_.first(pendedWearers), 'id');
    return undefined;
  }, [storedData, address]);

  const localHatToMintTo = useMemo(() => {
    if (hatToMintTo) return hatToMintTo;
    return initialHatToMintTo;
  }, [hatToMintTo, initialHatToMintTo]);

  const pendMintHatForHatter = useCallback(() => {
    if (!address || !localHatToMintTo) return;
    const existingHatToMintTo = _.find(storedData, ['id', localHatToMintTo]);

    // check for existing wearers
    const existingWearers = existingHatToMintTo?.wearers;
    if (existingHatToMintTo) {
      if (_.includes(_.map(existingWearers, 'address'), address)) return;
      const newHatToMintTo = {
        ...existingHatToMintTo,
        wearers: _.compact(_.concat(existingWearers, [{ address, ens: '' }])),
      };
      const withoutExisting = _.reject(storedData, ['id', hatToMintTo]);
      const newData = _.concat(withoutExisting, [newHatToMintTo]);
      setStoredData?.(newData);
      return;
    }
    setStoredData?.(
      _.compact(
        _.concat(storedData, [
          { id: hatToMintTo, wearers: [{ address, ens: '' }] },
        ]),
      ),
    );
    // TODO toast success
  }, [address, hatToMintTo, storedData, setStoredData, localHatToMintTo]);

  return {
    availableAdmins,
    hatToMintTo,
    hatToMintPended,
    pendMintHatForHatter,
  };
};

export default usePendHatterMint;
