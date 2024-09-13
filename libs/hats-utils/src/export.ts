import {
  DEFAULT_HAT,
  GATEWAY_TOKEN,
  GATEWAY_URL,
  MUTABILITY,
  TRIGGER_OPTIONS,
} from '@hatsprotocol/constants';
import {
  hatIdDecimalToIp,
  hatIdHexToDecimal,
  treeIdDecimalToHex,
} from '@hatsprotocol/sdk-v1-core';
import { Wearer } from '@hatsprotocol/sdk-v1-subgraph';
import _, { orderBy } from 'lodash';
import { idToPrettyId, ipToPrettyId, prettyIdToId, prettyIdToIp } from 'shared';
import { AppHat, FormData, FormWearer, HatExport, HatWearer } from 'types';
import { ipfsUrl } from 'utils';
import { Hex } from 'viem';

import { getAllDescendants } from './ancestry';
import { isTopHat } from './hats';

/**
 * Generates the parent ID for a given Hat ID
 * @param hatId the Hat Hex ID to calculate the parent ID of
 * @returns the parent ID of the given hat ID
 */
const calculateParentId = (hatId: Hex) => {
  if (!hatId) return undefined;

  const ipId = hatIdDecimalToIp(BigInt(hatId)); // TODO better strategy than converting to IP here?
  const splitIpId = _.split(ipId, '.');
  const parentId = _.join(
    _.slice(splitIpId, 0, _.subtract(_.size(splitIpId), 1)),
    '.',
  );
  const parentHex = prettyIdToId(ipToPrettyId(parentId));

  return parentHex;
};

const prepDraftsAndHats = (
  onchainHats: AppHat[] | undefined,
  drafts: Partial<FormData>[],
) => {
  const mapDrafts = _.map(drafts, (hat: Partial<FormData>) => {
    const adminId = hat.adminId || hat.parentId;
    if (!hat.id || !adminId) return undefined;
    return {
      id: hat.id,
      ipId: hatIdDecimalToIp(hatIdHexToDecimal(hat.id)),
      admin: {
        id: adminId,
      },
      imageUrl: hat.imageUrl,
    };
  });
  const mapOnchainHats = _.map(onchainHats, (hat: AppHat) => ({
    id: hat.id,
    ipId: hatIdDecimalToIp(hatIdHexToDecimal(hat.id)),
    admin: hat.admin,
    imageUrl: hat.imageUrl,
  }));

  const combinedHats = _.concat(mapOnchainHats, _.compact(mapDrafts));
  return combinedHats;
};

const getAdmins = (hats: any[], hatIpId: string) => {
  const admins = _.filter(hats, (hat: any) => {
    return hatIpId.includes(hat.ipId) && hat.ipId !== hatIpId;
  });
  return orderBy(admins, 'id', 'desc');
};

/**
 * Translate drafted changes into hats compatible with the org chart and viewing
 * @param chainId the chain ID of the tree
 * @param treeId the tree ID of the tree
 * @param onchainHats the hats that are already on-chain and their data
 * @param drafts the drafted changes to translate
 * @returns the translated hats
 */
export const translateDrafts = ({
  chainId,
  treeId,
  onchainHats,
  drafts,
}: {
  chainId: number;
  treeId: number;
  onchainHats?: AppHat[];
  drafts: Partial<FormData>[];
}): AppHat[] => {
  const extendDrafts = _.map(drafts, (hat: Partial<FormData>) => {
    if (!hat || !hat.id) return undefined;

    // TODO can break this up?
    const imageHats = prepDraftsAndHats(onchainHats, drafts);
    const admins = getAdmins(
      imageHats,
      hatIdDecimalToIp(hatIdHexToDecimal(hat.id)),
    );
    const firstAdminWithImage = _.find(admins, (h) => h.imageUrl !== '');
    const adminImageUrl = firstAdminWithImage
      ? { imageUrl: firstAdminWithImage.imageUrl }
      : {}; // TODO don't include when translating for export
    if (!hat.id) return undefined;
    return {
      id: hat.id,
      ..._.omit(hat, ['imageUrl']),
      ...DEFAULT_HAT,
      chainId,
      name: hatIdDecimalToIp(BigInt(hat.id)),
      detailsObject: {
        type: '1.0',
        data: {
          name: hat.name,
        },
      },
      imageUri: '',
      ...adminImageUrl,
      parentId: calculateParentId(hat.id),
      mutable: _.has(hat, 'mutable')
        ? hat.mutable === MUTABILITY.MUTABLE
        : true,
      levelAtLocalTree: _.subtract(
        _.size(_.split(hatIdDecimalToIp(BigInt(hat.id)), '.')),
        2, // top hat = 0, so subtract 2 to get level
      ),
      tree: {
        id: treeIdDecimalToHex(treeId),
      },
    };
  });

  const defined = _.reject(extendDrafts, _.isUndefined) as AppHat[];

  return _.sortBy(defined, (hat: AppHat) => BigInt(hat.id));
};

export const checkMissingParents = (
  hats: Partial<FormData>[],
  onchainHats: AppHat[] | undefined,
) => {
  if (!onchainHats) return true;
  const onchainIds = _.map(onchainHats, 'id');
  const draftIds = _.map(hats, 'id');
  const idList = _.uniq(_.concat(onchainIds, draftIds));

  const missingParent = _.filter(hats, (hat: any) => {
    const localHat = _.find(onchainHats, { id: hat.id });
    if (!hat.adminId && !localHat?.admin?.id) return true;
    return !_.includes(idList, hat.adminId || localHat?.admin?.id);
  });

  return _.some(missingParent);
};

export const checkMissingSiblings = (
  hats: Partial<FormData>[],
  onchainHats: AppHat[] | undefined,
) => {
  if (!onchainHats || !hats || hats.length === 0)
    return { hasMissing: false, missingSiblings: [] };

  const onchainPrettyIds = _.map(_.filter(onchainHats, 'id'), (hat: any) =>
    idToPrettyId(hat.id),
  );
  const hatsWithId = _.filter(hats, 'id');
  const allIdsSet = new Set([
    ...onchainPrettyIds,
    ..._.map(hatsWithId, (hat: any) => idToPrettyId(hat.id)),
  ]);

  const missingSiblings: string[] = [];

  _.forEach(hatsWithId, (hat: any) => {
    const prettyId = idToPrettyId(hat.id);
    const idSegments = prettyId.split('.');

    if (idSegments.length < 2 || !idSegments[0]) return;

    const siblingPrefix = idSegments.slice(0, -1).join('.');
    const siblingNumber = parseInt(idSegments[idSegments.length - 1], 16);

    if (siblingNumber > 1) {
      const previousSibling = `${siblingPrefix}.${(siblingNumber - 1)
        .toString(16)
        .padStart(4, '0')}`;
      if (!allIdsSet.has(previousSibling)) {
        missingSiblings.push(prettyIdToIp(previousSibling));
      }
    }
  });

  return {
    hasMissing: missingSiblings.length > 0,
    missingSiblings,
  };
};

const generateCsvContent = (hatWearers: HatWearer[]) => {
  // not fetching ens for all wearers
  let csvContent = 'address\n';

  hatWearers.forEach((hatWearer) => {
    const name = hatWearer.ensName || '';
    csvContent += `${hatWearer.id},${name}\n`;
  });

  return csvContent;
};

export const getBranch = (hatId: Hex, tree: AppHat[]): AppHat[] => {
  const targetHat = _.find(tree, { id: hatId });
  if (!targetHat) return [];

  const descendants = getAllDescendants(hatId, tree);

  return [targetHat, ...descendants];
};

export const exportToCsv = (hatWearers: HatWearer[], hatName?: string) => {
  const csvContent = generateCsvContent(hatWearers);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${hatName || 'hat'}-wearers.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const prepareExportTree = (data: any[]): HatExport[] => {
  return _.map(data, (hat: any) => {
    let imageUrl = hat.imageUri;
    // ! don't want to export image URL with our gateway and token string on it
    if (imageUrl.startsWith('https://')) {
      imageUrl = imageUrl.replace(`${GATEWAY_URL}`, 'ipfs://');
      imageUrl = imageUrl.replace(`?pinataGatewayToken=${GATEWAY_TOKEN}`, '');
    }

    return {
      id: hat.id,
      status: hat.status,
      createdAt: parseInt(hat.createdAt, 10),
      details: hat.details,
      maxSupply: parseInt(hat.maxSupply, 10),
      eligibility: hat.eligibility,
      toggle: hat.toggle,
      mutable: hat.mutable === MUTABILITY.MUTABLE,
      currentSupply: parseInt(hat.currentSupply, 10),
      wearers: hat.wearers,
      adminId: hat.adminId || hat.parentId,
      imageUri: imageUrl || '',
      // imageUrl: hat.imageUrl || '', // don't export imageUrl rn
      detailsObject: {
        type: '1.0',
        data: {
          name: hat.name,
          description: hat.description,
          // TODO should convert the imageUrl here to imageUri to not be confusing
          responsibilities: hat.responsibilities,
          authorities: hat.authorities,
          guilds: hat.guilds,
          spaces: hat.spaces,
          eligibility: {
            manual: hat.isEligibilityManual === TRIGGER_OPTIONS.MANUALLY,
            criteria: hat.revocationsCriteria,
          },
          toggle: {
            manual: hat.isToggleManual === TRIGGER_OPTIONS.MANUALLY,
            criteria: hat.deactivationsCriteria,
          },
        },
      },
    };
  });
};

// Helper function for exporting tree data
const mergeHatsWithStoredData = (
  hats: any[],
  storedData: Partial<FormData>[] | undefined,
) => {
  return _.map(hats, (hat: any) => {
    const storedHat = _.find(storedData, { id: hat.id });
    const mergedHat = _.merge({}, hat, storedHat);
    const imageUri = storedHat?.imageUrl ?? (hat?.imageUri || '');
    const imageUrl = ipfsUrl(imageUri?.slice(7));
    return {
      ...mergedHat,
      adminId: mergedHat?.adminId || storedHat?.parentId,
      imageUri,
      imageUrl: hat?.imageUrl === '/icon.jpeg' ? '' : imageUrl,
      wearers: _.map(mergedHat.wearers, 'address') || [],
    };
  });
};

interface ExportBranchProps {
  targetHatId?: Hex;
  treeToDisplayWithInactiveHats?: AppHat[];
  linkedHatIds?: Hex[];
  storedData?: Partial<FormData>[];
  decimalTreeId?: number;
  chainId?: number;
  toast: any;
  // shouldPatchIds?: boolean;
}

export const handleExportBranch = ({
  targetHatId,
  treeToDisplayWithInactiveHats,
  linkedHatIds,
  storedData,
  chainId,
  toast,
}: ExportBranchProps) => {
  if (
    !targetHatId ||
    !treeToDisplayWithInactiveHats ||
    !linkedHatIds ||
    !storedData ||
    !chainId
  )
    return;
  const branch = getBranch(targetHatId, treeToDisplayWithInactiveHats);
  const hatsWithoutLinkedHats = _.filter(
    branch,
    (hat: AppHat) => hat.id && !linkedHatIds?.includes(hat.id),
  );
  const targetHatInBranch = _.find(hatsWithoutLinkedHats, {
    id: targetHatId,
  });
  if (
    linkedHatIds?.includes(targetHatId) &&
    targetHatInBranch &&
    targetHatInBranch.admin
  ) {
    targetHatInBranch.admin.id = targetHatId;
  }
  const hatId = hatIdDecimalToIp(BigInt(targetHatId));
  const targetHat = _.find(treeToDisplayWithInactiveHats, { id: targetHatId });
  const type = isTopHat(targetHat) ? 'tree' : 'branch';

  const onchainHats = flattenHatData(hatsWithoutLinkedHats);
  const mergedHats = mergeHatsWithStoredData(onchainHats, storedData);
  const preparedTree = prepareExportTree(mergedHats);

  const fileData = JSON.stringify(preparedTree);
  const blob = new Blob([fileData], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = `chain-${chainId}-${type}-${hatId}.json`;
  link.href = url;
  link.click();
  toast.success({
    title: `Exported ${type} #${hatId} to your desktop`,
  });
};

const extractWearers = (wearers: unknown[]): FormWearer[] => {
  if (
    _.isArray(wearers) &&
    !_.isEmpty(wearers) &&
    _.isString(_.first(wearers))
  ) {
    return _.map(wearers, (wearer: unknown) => ({
      address: wearer as Hex,
      ens: '',
    }));
  }
  return _.map(wearers, (wearer: Wearer) => ({
    address: wearer.id,
    ens: '',
  })) as unknown as FormWearer[];
};

// general helper functions for importing and exporting tree data
export const flattenHatData = (data: any[]): FormData[] =>
  _.map(
    data || [],
    (hat: any) =>
      ({
        id: hat.id,
        status: hat.status,
        createdAt: _.toNumber(hat.createdAt),
        // details: hat.details,
        maxSupply: _.toString(hat.maxSupply),
        eligibility: hat.eligibility,
        isEligibilityManual:
          hat.detailsObject?.data?.eligibility?.manual !== false
            ? TRIGGER_OPTIONS.MANUALLY
            : TRIGGER_OPTIONS.AUTOMATICALLY,
        revocationsCriteria:
          hat.detailsObject?.data?.eligibility?.criteria || [],
        toggle: hat.toggle,
        isToggleManual:
          hat.detailsObject?.data?.toggle?.manual !== false
            ? TRIGGER_OPTIONS.MANUALLY
            : TRIGGER_OPTIONS.AUTOMATICALLY,
        deactivationsCriteria: _.get(
          hat,
          'detailsObject.data.toggle.criteria',
          [],
        ),
        mutable: hat.mutable ? MUTABILITY.MUTABLE : MUTABILITY.IMMUTABLE,
        // imageUri: hat.imageUri,
        currentSupply: _.toNumber(hat.currentSupply),
        wearers: extractWearers(hat.wearers),
        adminId: hat.adminId || hat.parentId || _.get(hat, 'admin.id'),
        // imported as imageUri from export data, likely imageUrl from `storedData`
        imageUrl: hat.imageUrl || ipfsUrl(hat.imageUri.slice(7)),
        imageUri: hat.imageUri,
        name: _.get(hat, 'detailsObject.data.name', 'New Hat'),
        description: _.get(
          hat,
          'detailsObject.data.description',
          '', // was there a reason for override string vs empty
        ),
        responsibilities: _.get(hat, 'detailsObject.data.responsibilities', []),
        authorities: _.get(hat, 'detailsObject.data.authorities', []),
        guilds: _.get(hat, 'detailsObject.data.guilds', []),
        spaces: _.get(hat, 'detailsObject.data.spaces', []),
      }) as FormData,
  );
