/* eslint-disable import/prefer-default-export */
import { HatsClient } from '@hatsprotocol/sdk-v1-core';
import _ from 'lodash';

import { FALLBACK_ADDRESS, MUTABILITY, TRIGGER_OPTIONS } from '@/constants';
import { FormData, FormDataDetails, HatDetails, IHat } from '@/types';

import { getDefaultAdminId } from './hats';
import { calculateCid, ipfsUrl } from './ipfs';
import { createHatsClient } from './web3';

const hasDetailsChanged = (hat: Partial<FormDataDetails>) => {
  const {
    name,
    description,
    guilds,
    responsibilities,
    authorities,
    isEligibilityManual,
    revocationsCriteria,
    isToggleManual,
    deactivationsCriteria,
  } = hat;

  return (
    name ||
    description ||
    _.gt(_.size(guilds), 0) ||
    _.gt(_.size(responsibilities), 0) ||
    _.gt(_.size(authorities), 0) ||
    isEligibilityManual ||
    _.gt(_.size(revocationsCriteria), 0) ||
    isToggleManual ||
    _.gt(_.size(deactivationsCriteria), 0)
  );
};

const createDetailsData = ({ hat }: { hat: Partial<FormData> }): HatDetails => {
  const {
    isEligibilityManual,
    isToggleManual,
    revocationsCriteria,
    deactivationsCriteria,
    name,
    description,
    guilds,
    responsibilities,
    authorities,
  } = hat;

  const detailsData = {
    name: name || '',
    description: description || '',
    guilds: guilds || [],
    responsibilities: _.reject(responsibilities, ['label', '']),
    authorities: _.reject(authorities, ['label', '']),
    eligibility: {
      manual: isEligibilityManual
        ? isEligibilityManual === TRIGGER_OPTIONS.MANUALLY
        : true,
      criteria: _.reject(revocationsCriteria, ['label', '']) || [],
    },
    toggle: {
      manual: isToggleManual
        ? isToggleManual === TRIGGER_OPTIONS.MANUALLY
        : true,
      criteria: _.reject(deactivationsCriteria, ['label', '']) || [],
    },
  };

  return detailsData;
};

const createNewHatData = ({
  hat,
  details,
}: {
  hat: Partial<FormData>;
  details: string;
}) => {
  const { maxSupply, eligibility, toggle, mutable, imageUrl, id: hatId } = hat;

  if (!hatId) return undefined;

  return {
    admin: BigInt(getDefaultAdminId(hatId)),
    details,
    maxSupply: _.toNumber(maxSupply) || 1,
    eligibility: eligibility || FALLBACK_ADDRESS,
    toggle: toggle || FALLBACK_ADDRESS,
    mutable: mutable ? mutable === MUTABILITY.MUTABLE : true,
    imageURI: imageUrl || '',
  };
};

interface ProcessCallForHatReturnProps {
  calls: any[];
  hatChanges: any;
  detailsToPin: any;
}

interface ProcessCallForHatProps {
  hatsClient: HatsClient;
  chainId?: number;
  hat: Partial<FormData>;
  returnData: ProcessCallForHatReturnProps;
}

const emptyReturnData = {
  calls: [],
  hatChanges: {},
  detailsToPin: undefined,
};

const processNewDetailsCallForHat = async ({
  hatsClient,
  chainId,
  hat,
  returnData,
}: ProcessCallForHatProps): Promise<ProcessCallForHatReturnProps> => {
  const { calls } = returnData;
  let newHatChanges = {} as any;
  const { id, imageUrl } = hat;

  const detailsData = createDetailsData({ hat });
  const details = await calculateCid({ type: '1.0', data: detailsData });

  if (!id || !details) return returnData;
  const newHat = createNewHatData({ hat, details });
  if (!newHat) return returnData;
  const newHatData = hatsClient.createHatCallData(newHat);

  if (!newHatData) return returnData;

  newHatChanges = {
    ...newHat,
    id,
    admin: {
      id: getDefaultAdminId(id),
    },
    detailsObject: {
      type: '1.0',
      data: detailsData,
    },
    chainId,
    imageUri: imageUrl,
    imageUrl: imageUrl ? ipfsUrl(imageUrl?.slice(7)) : '/icon.jpeg',
  };

  return {
    calls: _.concat(calls, newHatData),
    hatChanges: newHatChanges,
    detailsToPin: { hatId: id, chainId, details: detailsData },
  };
};

const processWearersCallForHat = async ({
  hatsClient,
  hat,
  returnData,
}: ProcessCallForHatProps) => {
  const { calls, hatChanges } = returnData;
  const { wearers, id: hatId } = hat;

  if (!hatId || !hatsClient || !wearers) return returnData;

  if (_.eq(_.size(wearers), 1)) {
    const wearer = _.first(wearers);
    if (!wearer) return returnData;

    const mintHatWearersData = hatsClient?.mintHatCallData({
      hatId: BigInt(hatId),
      wearer: _.get(wearer, 'address'),
    });

    if (!mintHatWearersData) return returnData;

    const newHatChanges = {
      ...hatChanges,
      wearers: [wearer],
    };
    return {
      ...returnData,
      calls: _.concat(calls, mintHatWearersData),
      hatChanges: newHatChanges,
    };
  }
  if (_.gt(_.size(wearers), 1)) {
    const batchMintHatWearersData = hatsClient.batchMintHatsCallData({
      hatIds: Array(_.size(wearers)).fill(BigInt(hatId)),
      wearers: _.map(wearers, 'address'),
    });

    if (!batchMintHatWearersData) return returnData;

    const newHatChanges = {
      ...hatChanges,
      wearers,
    };
    return {
      ...returnData,
      calls: _.concat(calls, batchMintHatWearersData),
      hatChanges: newHatChanges,
    };
  }

  return returnData;
};

type ProcessDetailsChangeCallForHatProps = {
  onchainHat: IHat | undefined;
} & ProcessCallForHatProps;

const processDetailsChangeCallForHat = async ({
  hatsClient,
  hat,
  chainId,
  returnData,
  onchainHat,
}: ProcessDetailsChangeCallForHatProps) => {
  const { id: hatId } = hat;

  if (!hatId || !hasDetailsChanged(hat)) return returnData;

  const { calls, hatChanges } = returnData;

  const existingDetails = _.get(onchainHat, 'detailsObject.data');

  const newDetails = createDetailsData({ hat });
  const combinedDetails = _.merge({}, existingDetails, newDetails);
  const newCid = await calculateCid({ type: '1.0', data: combinedDetails });

  const changeHatDetailsData = hatsClient.changeHatDetailsCallData({
    hatId: BigInt(hatId),
    newDetails: newCid,
  });

  if (!changeHatDetailsData) return returnData;

  const newChanges = {
    ...hatChanges,
    details: newCid,
  };

  return {
    calls: _.concat(calls, changeHatDetailsData),
    hatChanges: newChanges,
    detailsToPin: { hatId, chainId, details: combinedDetails },
  };
};

const processMaxSupplyChangeCallForHat = async ({
  hatsClient,
  hat,
  returnData,
}: ProcessCallForHatProps) => {
  const { calls, hatChanges } = returnData;
  const { maxSupply, id: hatId } = hat;

  if (!hatId || !maxSupply) return returnData;

  const changeHatMaxSupplyData = hatsClient.changeHatMaxSupplyCallData({
    hatId: BigInt(hatId),
    newMaxSupply: _.toNumber(maxSupply),
  });

  if (!changeHatMaxSupplyData) return returnData;

  const newHatChanges = {
    ...hatChanges,
    maxSupply: _.toNumber(maxSupply),
  };

  return {
    ...returnData,
    calls: _.concat(calls, changeHatMaxSupplyData),
    hatChanges: newHatChanges,
  };
};

const processEligibilityChangeCallForHat = async ({
  hatsClient,
  hat,
  returnData,
}: ProcessCallForHatProps) => {
  const { calls, hatChanges } = returnData;
  const { eligibility, id: hatId } = hat;

  if (!hatId || !eligibility) return returnData;

  const changeHatEligibilityData = hatsClient.changeHatEligibilityCallData({
    hatId: BigInt(hatId),
    newEligibility: eligibility,
  });

  if (!changeHatEligibilityData) return returnData;

  const newHatChanges = {
    ...hatChanges,
    eligibility,
  };

  return {
    ...returnData,
    calls: _.concat(calls, changeHatEligibilityData),
    hatChanges: newHatChanges,
  };
};

const processToggleChangeCallForHat = async ({
  hatsClient,
  hat,
  returnData,
}: ProcessCallForHatProps) => {
  const { calls, hatChanges } = returnData;
  const { toggle, id: hatId } = hat;

  if (!hatId || !toggle) return returnData;

  const changeHatToggleData = hatsClient.changeHatToggleCallData({
    hatId: BigInt(hatId),
    newToggle: toggle,
  });

  if (!changeHatToggleData) return returnData;

  const newHatChanges = {
    ...hatChanges,
    toggle,
  };

  return {
    ...returnData,
    calls: _.concat(calls, changeHatToggleData),
    hatChanges: newHatChanges,
  };
};

const processMutabilityChangeCallForHat = async ({
  hatsClient,
  hat,
  returnData,
}: ProcessCallForHatProps) => {
  const { calls, hatChanges } = returnData;
  const { mutable, id: hatId } = hat;

  if (!hatId || (!!mutable && mutable) || mutable === undefined)
    return returnData;

  const makeHatImmutableData = hatsClient.makeHatImmutableCallData({
    hatId: BigInt(hatId),
  });

  if (!makeHatImmutableData) return returnData;

  const newHatChanges = {
    ...hatChanges,
    mutable: false,
  };

  return {
    ...returnData,
    calls: _.concat(calls, makeHatImmutableData),
    hatChanges: newHatChanges,
  };
};

const processImageChangeCallForHat = async ({
  hatsClient,
  hat,
  returnData,
}: ProcessCallForHatProps) => {
  const { calls, hatChanges } = returnData;
  const { imageUrl, id: hatId } = hat;

  if (!hatId || !imageUrl) return returnData;

  const changeHatImageUriData = hatsClient.changeHatImageURICallData({
    hatId: BigInt(hatId),
    newImageURI: imageUrl,
  });

  if (!changeHatImageUriData) return returnData;

  const newHatChanges = {
    ...hatChanges,
    imageUri: imageUrl,
    imageUrl: imageUrl ? ipfsUrl(imageUrl?.slice(7)) : '/icon.jpeg',
  };

  return {
    ...returnData,
    calls: _.concat(calls, changeHatImageUriData),
    hatChanges: newHatChanges,
  };
};

export const processHatForCalls = async (
  hat: Partial<FormData>,
  onchainHats?: IHat[],
  chainId?: number,
) => {
  const hatsClient = createHatsClient(chainId);
  if (!hat || !hatsClient || !chainId) return emptyReturnData;

  if (!_.includes(_.map(onchainHats, 'id'), _.get(hat, 'id'))) {
    const newDetailsResult = await processNewDetailsCallForHat({
      hatsClient,
      chainId,
      hat,
      returnData: emptyReturnData,
    });
    const wearersResult = await processWearersCallForHat({
      hatsClient,
      hat,
      returnData: newDetailsResult,
    });
    return wearersResult;
  }

  const detailsResult = await processDetailsChangeCallForHat({
    hatsClient,
    chainId,
    hat,
    returnData: emptyReturnData,
    onchainHat: _.find(onchainHats, ['id', _.get(hat, 'id')]),
  });
  const maxSupplyResult = await processMaxSupplyChangeCallForHat({
    hatsClient,
    hat,
    returnData: detailsResult,
  });
  const wearersResult = await processWearersCallForHat({
    hatsClient,
    hat,
    returnData: maxSupplyResult,
  });
  const eligibilityResult = await processEligibilityChangeCallForHat({
    hatsClient,
    hat,
    returnData: wearersResult,
  });
  const toggleResult = await processToggleChangeCallForHat({
    hatsClient,
    hat,
    returnData: eligibilityResult,
  });
  const mutabilityResult = await processMutabilityChangeCallForHat({
    hatsClient,
    hat,
    returnData: toggleResult,
  });
  const imageResult = await processImageChangeCallForHat({
    hatsClient,
    hat,
    returnData: mutabilityResult,
  });

  return imageResult;
};
