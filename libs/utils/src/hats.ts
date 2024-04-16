/* eslint-disable import/prefer-default-export */
import { Hat } from '@hatsprotocol/sdk-v1-subgraph';
import _ from 'lodash';

// ! move to hat-utils?

export const getInactiveIds = (tree: Hat[] | undefined) => {
  const localInactiveHats = _.filter(tree, { status: false });
  const descendantsOfInactiveHats = _.filter(tree, (hat: Hat) =>
    _.some(_.map(localInactiveHats, 'prettyId'), (inactiveHat: string) =>
      // using prettyId should cover all descendants without needing recursive sort
      _.startsWith(hat.prettyId, inactiveHat),
    ),
  );

  return _.uniq(
    _.map(_.concat(localInactiveHats, descendantsOfInactiveHats), 'id'),
  );
};

export const removeInactiveHatsAndDescendants = (tree: Hat[] | undefined) => {
  if (!tree) return [];
  //  hat objects will need prettyId (for now) and status
  const inactiveIds = getInactiveIds(tree);

  return _.reject(tree, (hat: Hat) => _.includes(inactiveIds, hat.id));
};
