import { HatsClient } from '@hatsprotocol/sdk-v1-core';
import { FALLBACK_ADDRESS, MUTABILITY, TRIGGER_OPTIONS } from 'app-constants';
import {
  AppHat,
  FieldItem,
  FormData,
  FormDataDetails,
  FormFieldKeys,
  HatDetails,
  HatDetailsKeys,
  InputObject,
  SupportedChains,
} from 'hats-types';
import _ from 'lodash';
import { createHierarchy, getDefaultAdminId } from 'shared-utils';
import { Hex } from 'viem';

import { calculateCid, ipfsUrl, urlToIpfsUri } from '../ipfs';
import { createHatsClient, publicClient } from '../web3';

const hasDetailsChanged = (
  currentHat: Partial<FormDataDetails>,
  originalHat?: AppHat,
) => {
  const originalHatDetails = _.get(originalHat, 'detailsObject.data');
  const {
    name,
    description,
    guilds,
    spaces,
    responsibilities,
    authorities,
    isEligibilityManual,
    revocationsCriteria,
    isToggleManual,
    deactivationsCriteria,
  } = currentHat;

  const namePlainText = !_.startsWith(_.get(originalHat, 'details'), 'ipfs://');
  const hasGuildsChanged =
    _.gt(_.size(guilds), 0) ||
    _.size(guilds) !== _.size(originalHatDetails?.guilds);
  const hasSpacesChanged =
    _.gt(_.size(spaces), 0) ||
    _.size(spaces) !== _.size(originalHatDetails?.spaces);
  const hasResponsibilitiesChanged =
    _.gt(_.size(responsibilities), 0) ||
    _.size(responsibilities) !== _.size(originalHatDetails?.responsibilities);
  const hasAuthoritiesChanged =
    _.gt(_.size(authorities), 0) ||
    _.size(authorities) !== _.size(originalHatDetails?.authorities);
  const hasRevocationsCriteriaChanged =
    _.gt(_.size(revocationsCriteria), 0) ||
    _.size(revocationsCriteria) !==
      _.size(originalHatDetails?.eligibility?.criteria);
  const hasDeactivationsCriteriaChanged =
    _.gt(_.size(deactivationsCriteria), 0) ||
    _.size(deactivationsCriteria) !==
      _.size(originalHatDetails?.toggle?.criteria);

  return (
    !!name ||
    !!namePlainText ||
    !!description ||
    !!hasGuildsChanged ||
    !!hasSpacesChanged ||
    !!hasResponsibilitiesChanged ||
    !!hasAuthoritiesChanged ||
    !!isEligibilityManual ||
    !!hasRevocationsCriteriaChanged ||
    !!isToggleManual ||
    !!hasDeactivationsCriteriaChanged
  );
};

const createDetailsData = ({
  hat,
  originalHat,
}: {
  hat: Partial<FormData>;
  originalHat?: AppHat;
}): HatDetails => {
  const {
    isEligibilityManual,
    isToggleManual,
    revocationsCriteria,
    deactivationsCriteria,
    name,
    displayName,
    description,
    guilds,
    spaces,
    responsibilities,
    authorities,
  } = hat;

  let updateName = _.get(originalHat, 'detailsObject.data.name');
  if (name || displayName) updateName = name || displayName;
  if (!updateName) updateName = _.get(originalHat, 'details');

  const detailsData: HatDetails = {
    name: updateName || '',
    description: description || '',
    responsibilities: _.reject(responsibilities, ['label', '']),
    authorities: _.reject(authorities, ['label', '']),
    eligibility: {
      manual: isEligibilityManual
        ? isEligibilityManual === TRIGGER_OPTIONS.MANUALLY
        : _.get(originalHat, 'detailsObject.data.eligibility.manual', true),
      criteria: _.reject(revocationsCriteria, ['label', '']) || [],
    },
    toggle: {
      manual: isToggleManual
        ? isToggleManual === TRIGGER_OPTIONS.MANUALLY
        : true,
      criteria: _.reject(deactivationsCriteria, ['label', '']) || [],
    },
  };

  if (guilds) {
    detailsData.guilds = guilds;
  }
  if (spaces) {
    detailsData.spaces = spaces;
  }

  return detailsData;
};

const createNewHatData = async ({
  hat,
  details,
}: {
  hat: Partial<FormData>;
  details: string;
}) => {
  const { maxSupply, eligibility, toggle, mutable, imageUrl, id: hatId } = hat;

  if (!hatId) return undefined;
  let localEligibility = eligibility;
  const localToggle = toggle;
  if (eligibility?.includes('.eth')) {
    localEligibility =
      (await publicClient({ chainId: 1 }).getEnsAddress({
        name: eligibility,
      })) || undefined;
  }
  if (toggle?.includes('.eth')) {
    localEligibility =
      (await publicClient({ chainId: 1 }).getEnsAddress({
        name: toggle,
      })) || undefined;
  }

  const admin = getDefaultAdminId(hatId);
  if (!admin || admin === '0x') {
    // eslint-disable-next-line no-console
    console.log('admin is undefined');
    return undefined;
  }
  const imageUri = imageUrl?.startsWith('https://')
    ? urlToIpfsUri(imageUrl)
    : imageUrl;

  return {
    admin: BigInt(getDefaultAdminId(hatId)),
    details,
    maxSupply: _.toNumber(maxSupply) || 0,
    eligibility: localEligibility || FALLBACK_ADDRESS,
    toggle: localToggle || FALLBACK_ADDRESS,
    mutable: mutable ? mutable === MUTABILITY.MUTABLE : true,
    imageURI: imageUri || '',
  };
};

interface ProcessCallForHatReturnProps {
  calls: {
    functionName: string;
    callData: Hex;
  }[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  hatChanges: any; // Partial<FormData>;
  detailsToPin?: { hatId: Hex; chainId: SupportedChains; details: HatDetails };
}

interface ProcessCallForHatProps {
  hatsClient: HatsClient;
  chainId?: SupportedChains;
  hat: Partial<FormData>;
  returnData: ProcessCallForHatReturnProps;
}

const emptyReturnData = {
  calls: [],
  hatChanges: {},
};

const processNewDetailsCallForHat = async ({
  hatsClient,
  chainId,
  hat,
  returnData,
}: ProcessCallForHatProps): Promise<ProcessCallForHatReturnProps> => {
  const { calls } = returnData;
  let newHatChanges = {} as Partial<AppHat>;
  const { id, imageUrl } = hat;

  const detailsData = createDetailsData({ hat });
  const details = await calculateCid({ type: '1.0', data: detailsData });

  if (!id || !details || !chainId) return returnData;
  const newHat = await createNewHatData({ hat, details });
  if (!newHat) return returnData;
  const newHatData = hatsClient.createHatCallData(newHat);

  if (!newHatData) return returnData;
  const imageUri = imageUrl?.startsWith('https://')
    ? urlToIpfsUri(imageUrl)
    : imageUrl;

  newHatChanges = {
    ...newHat,
    id,
    maxSupply: _.toString(newHat.maxSupply),
    admin: {
      id: getDefaultAdminId(id),
    },
    detailsObject: {
      type: '1.0',
      data: detailsData,
    },
    chainId,
    imageUri: imageUri || undefined,
    imageUrl,
  };

  return {
    calls: _.concat(calls, newHatData),
    hatChanges: newHatChanges,
    detailsToPin: { hatId: id, chainId, details: detailsData },
  };
};

const processWearersCallForHat = ({
  hatsClient,
  hat,
  returnData,
}: ProcessCallForHatProps) => {
  const { calls, hatChanges } = returnData;
  const { wearers, id: hatId } = hat;

  if (!hatId || !hatsClient || !wearers || wearers.length === 0)
    return returnData;

  const isWearerFormatString = typeof wearers[0] === 'string';
  const adaptedWearers = isWearerFormatString
    ? wearers
    : wearers.map((wearer) => wearer.address);

  if (_.eq(_.size(wearers), 1)) {
    const mintHatWearersData = hatsClient?.mintHatCallData({
      hatId: BigInt(hatId),
      wearer: adaptedWearers[0] as Hex,
    });

    if (!mintHatWearersData) return returnData;

    return {
      ...returnData,
      calls: _.concat(calls, mintHatWearersData),
      hatChanges: {
        ...hatChanges,
        wearers: [adaptedWearers[0]],
      },
    };
  }

  if (_.gt(_.size(wearers), 1)) {
    const batchMintHatWearersData = hatsClient.batchMintHatsCallData({
      hatIds: Array(_.size(wearers)).fill(BigInt(hatId)),
      wearers: adaptedWearers as Hex[],
    });

    if (!batchMintHatWearersData) return returnData;

    return {
      ...returnData,
      calls: _.concat(calls, batchMintHatWearersData),
      hatChanges: {
        ...hatChanges,
        wearers: adaptedWearers,
      },
    };
  }

  return returnData;
};

type ProcessDetailsChangeCallForHatProps = {
  onchainHat: AppHat | undefined;
} & ProcessCallForHatProps;

const processDetailsChangeCallForHat = async ({
  hatsClient,
  hat,
  chainId,
  returnData,
  onchainHat,
}: ProcessDetailsChangeCallForHatProps) => {
  const { id: hatId } = hat;

  if (!hatId || !hasDetailsChanged(hat, onchainHat) || !chainId)
    return returnData;

  const { calls, hatChanges } = returnData;

  const existingDetails: HatDetails | undefined =
    _.get(onchainHat, 'detailsObject.data') || undefined;
  const newDetails: HatDetails = createDetailsData({
    hat,
    originalHat: onchainHat,
  });

  const combinedDetails = _.reduce(
    existingDetails,

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (acc: any, existingValue: any, key: string) => {
      const localKey = key as HatDetailsKeys;
      const newValue = newDetails[localKey];

      if (
        _.isArray(newValue) &&
        _.isEmpty(newValue) &&
        hat[key as keyof FormData] !== undefined
      ) {
        acc[localKey] = newValue;
      } else if (
        (_.isArray(existingValue) && _.isArray(newValue)) ||
        (_.isObject(existingValue) && _.isObject(newValue))
      ) {
        if (!_.includes(_.keys(hat), key)) {
          // skip update for non-"dirty" fields when values are arrays
          acc[localKey] = existingValue;
        } else {
          // should catch reset to empty array
          acc[localKey] = newValue;
        }
      } else {
        acc[key] = newValue || existingValue;
      }
      return acc;
    },
    _.merge({}, existingDetails, newDetails),
  );

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

const processMaxSupplyChangeCallForHat = ({
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

  let localEligibility = eligibility;
  if (!hatId || !eligibility) return returnData;

  if (eligibility.includes('.eth')) {
    localEligibility =
      (await publicClient({ chainId: 1 }).getEnsAddress({
        name: eligibility,
      })) || undefined;
  }

  if (!localEligibility) return returnData;

  const changeHatEligibilityData = hatsClient.changeHatEligibilityCallData({
    hatId: BigInt(hatId),
    newEligibility: localEligibility,
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

  let localToggle = toggle;
  if (!hatId || !toggle) return returnData;

  if (toggle.includes('.eth')) {
    localToggle =
      (await publicClient({ chainId: 1 }).getEnsAddress({
        name: toggle,
      })) || undefined;
  }

  if (!localToggle) return returnData;

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

const processMutabilityChangeCallForHat = ({
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

  const imageUri = imageUrl.startsWith('https://')
    ? urlToIpfsUri(imageUrl)
    : imageUrl;

  if (!imageUri) return returnData;

  const changeHatImageUriData = hatsClient.changeHatImageURICallData({
    hatId: BigInt(hatId),
    newImageURI: imageUri,
  });

  if (!changeHatImageUriData) return returnData;

  const newHatChanges = {
    ...hatChanges,
    imageUri,
    imageUrl: imageUri ? ipfsUrl(imageUri) : '/icon.jpeg',
  };

  return {
    ...returnData,
    calls: _.concat(calls, changeHatImageUriData),
    hatChanges: newHatChanges,
  };
};

export const processHatForCalls = async (
  hat: Partial<FormData>,
  onchainHats?: AppHat[],
  chainId?: SupportedChains,
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
    const wearersResult = processWearersCallForHat({
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
  const maxSupplyResult = processMaxSupplyChangeCallForHat({
    hatsClient,
    hat,
    returnData: detailsResult,
  });
  const wearersResult = processWearersCallForHat({
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
  const mutabilityResult = processMutabilityChangeCallForHat({
    hatsClient,
    hat,
    returnData: toggleResult,
  });
  const imageResult = processImageChangeCallForHat({
    hatsClient,
    hat,
    returnData: mutabilityResult,
  });

  return imageResult;
};

export const removeAndHandleSiblings = (
  storedData: Partial<FormData>[],
  hatId: Hex,
) => {
  const storedHat = _.find(storedData, ['id', hatId]);
  const hierarchy = createHierarchy(
    storedData as unknown as InputObject[],
    hatId,
  );

  const noEmptyChanges = _.reject(storedData, (d: Partial<FormData>) =>
    _.isEmpty(_.reject(_.keys(d), (k: string) => k === 'id')),
  );

  const newSiblings = _.filter(noEmptyChanges, [
    'parentId',
    storedHat?.parentId,
  ]);

  const updateSiblings = _.map(newSiblings, (child: { id: Hex }, i: number) => {
    const childId = child.id;
    if (i === newSiblings.length - 1 || !childId) return undefined;

    const isLeftSib = _.includes(_.get(hierarchy, 'leftSiblings'), childId);
    if (isLeftSib) return child;

    return { ...newSiblings[i + 1], id: childId };
  });

  const filterSiblings = _.reject(storedData, (child: Partial<FormData>) =>
    _.includes(_.map(newSiblings, 'id'), child.id),
  );

  return _.concat(
    filterSiblings,
    _.compact(updateSiblings) as unknown as Partial<FormData>[],
  );
};

export const removeAndHandleSiblingsOrgChart = (hats: AppHat[], hatId: Hex) => {
  const orgChartHat = _.find(hats, ['id', hatId]);
  const newSiblings = _.filter(hats, ['parentId', orgChartHat?.parentId]);

  const updateSiblings = _.map(newSiblings, (child: { id: Hex }, i: number) => {
    if (i + 1 === newSiblings.length) return undefined;

    // TODO do we need to handle left siblings here?
    return { ...newSiblings[i + 1], id: child.id };
  });

  const filterSiblings = _.reject(hats, (child: AppHat) =>
    _.includes(_.concat(_.map(newSiblings, 'id'), [orgChartHat?.id]), child.id),
  );

  return _.concat(filterSiblings, _.compact(updateSiblings));
};

// get dirty fields
export const getDirtyFields = (
  formValues: Partial<FormData>,
  defaultFormValues: Partial<FormData>,
): string[] => {
  const excludeKeys = ['id', 'parentId', 'adminId', 'imageUri'];

  return _.filter(_.keys(formValues), (key: FormFieldKeys) => {
    if (_.includes(excludeKeys, key)) return false;
    if (key === 'imageUrl') {
      return (
        formValues.imageUrl !== defaultFormValues.imageUrl &&
        formValues.imageUrl !== undefined
      );
    }
    // if (value === _.get(defaultHat, key)) return false;

    return (
      JSON.stringify(defaultFormValues[key]) !== JSON.stringify(formValues[key])
      // || formValues[key] === 'New Hat'
    );
  }) as string[];
};

export const fieldsAreDirty = (
  fieldsArray: FieldItem[],
  dirtyFields: string[],
) => {
  return _.map(
    _.filter(fieldsArray, (field: FieldItem) =>
      _.includes(dirtyFields, field.name as string),
    ),
    'label',
  );
};
