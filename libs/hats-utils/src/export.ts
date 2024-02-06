/* eslint-disable import/prefer-default-export */
import { hatIdDecimalToIp } from '@hatsprotocol/sdk-v1-core';
import { DEFAULT_HAT, MUTABILITY } from '@hatsprotocol/constants';
import { AppHat, FormData } from 'hats-types';
import _ from 'lodash';
import { ipToPrettyId, prettyIdToId } from 'shared';
import { Hex } from 'viem';

const calculateParentId = (hatId: Hex) => {
  if (!hatId) return undefined;
  const ipId = hatIdDecimalToIp(BigInt(hatId));
  const splitIpId = _.split(ipId, '.');
  const parentId = _.join(
    _.slice(splitIpId, 0, _.subtract(_.size(splitIpId), 1)),
    '.',
  );
  const parentHex = prettyIdToId(ipToPrettyId(parentId));

  return parentHex;
};

export const translateDrafts = ({
  chainId,
  treeId,
  drafts,
}: {
  chainId: number;
  treeId: Hex;
  drafts: Partial<FormData>[];
}): AppHat[] => {
  const extendDrafts = _.map(drafts, (hat) => {
    if (!hat.id) return undefined;
    return {
      ..._.omit(hat, ['imageUrl']),
      ...DEFAULT_HAT,
      chainId,
      name: hatIdDecimalToIp(BigInt(hat.id)),
      detailsObject: {
        type: '1.0',
        data: {
          name: hat.name || 'New AppHat',
        },
      },
      imageUri: '',
      parentId: calculateParentId(hat.id),
      mutable: _.has(hat, 'mutable')
        ? hat.mutable === MUTABILITY.MUTABLE
        : true,
      levelAtLocalTree: _.subtract(
        _.size(_.split(hatIdDecimalToIp(BigInt(hat.id)), '.')),
        2, // top hat = 0, so subtract 2 to get level
      ),
      tree: {
        id: treeId,
      },
    };
  });

  const defined = _.reject(extendDrafts, _.isUndefined) as AppHat[];

  return _.sortBy(defined, (hat) => BigInt(hat.id));
};
