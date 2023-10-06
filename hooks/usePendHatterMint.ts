import _ from 'lodash';
import { useCallback, useMemo } from 'react';
import { Hex } from 'viem';

import { useTreeForm } from '@/contexts/TreeFormContext';

const usePendHatterMint = ({ address }: { address?: Hex }) => {
  const { treeToDisplay, selectedHat, storedData, setStoredData } =
    useTreeForm();

  const availableAdmins = useMemo(() => {
    const noTopHat = _.slice(treeToDisplay, 1);
    const removeCurrentHat = _.reject(noTopHat, ['id', selectedHat?.id]);
    // todo remove hats where current supply = max supply
    // todo remove non lineage
    return removeCurrentHat;
  }, [treeToDisplay, selectedHat]);

  const hatToMintTo = useMemo(() => {
    if (!availableAdmins) return undefined;
    return _.get(_.first(availableAdmins), 'id');
  }, [availableAdmins]);

  const hatToMintPended = useMemo(() => {
    const pendedWearers = _.flatten(_.map(storedData, 'wearers'));
    if (!pendedWearers) return false;
    if (_.includes(_.map(pendedWearers, 'address'), address)) return true;
    return false;
  }, [storedData, address]);

  const pendMintHatForHatter = useCallback(() => {
    if (!address || !hatToMintTo) return;
    const existingHatToMintTo = _.find(storedData, ['id', hatToMintTo]);

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
  }, [address, hatToMintTo, storedData, setStoredData]);

  return {
    availableAdmins,
    hatToMintTo,
    hatToMintPended,
    pendMintHatForHatter,
  };
};

export default usePendHatterMint;
