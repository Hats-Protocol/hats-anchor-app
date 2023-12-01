/* eslint-disable import/prefer-default-export */
import _ from 'lodash';

import { AUTHORITY_TYPES } from '@/constants';
import { Authority, AuthorityType } from '@/types';

export const combineAuthorities = ({
  authorities,
  guildRoles,
  spaces,
}: {
  authorities: Authority[] | undefined;
  guildRoles: Authority[] | undefined;
  spaces: Authority[] | undefined;
}) => {
  const socialAuthorities = _.map(authorities, (authority) => ({
    ...authority,
    type: AUTHORITY_TYPES.manual as AuthorityType,
  }));

  // authorities with matching link
  const matchingAuthorities = _.filter(
    socialAuthorities,
    (authority) =>
      _.includes(_.map(guildRoles, 'link'), authority.link) ||
      _.includes(_.map(spaces, 'link'), authority.link),
  );
  const mergedAuthorities = _.map(matchingAuthorities, (authority) => {
    const guildRole = _.find(guildRoles, ['link', authority.link]);
    const guildProps = _.pick(guildRole, ['gate', 'type']);
    const space = _.find(spaces, ['link', authority.link]);
    const spaceProps = _.pick(space, ['gate', 'type']);
    return {
      ...authority,
      ...guildProps,
      ...spaceProps,
    };
  });

  // authorities without matching link
  const nonMatchingAuthorities = _.reject(
    _.concat(guildRoles, spaces),
    (authority) =>
      _.includes(_.map(socialAuthorities, 'link'), authority?.link),
  );

  // authorities that aren't in guildRoles or spaces
  const filteredAuthorities = _.reject(socialAuthorities, (authority) =>
    _.includes(_.map(matchingAuthorities, 'link'), authority.link),
  );

  // combine authorities
  const combined = _.concat(
    mergedAuthorities,
    nonMatchingAuthorities,
    filteredAuthorities,
  );

  return { data: _.compact(combined) };
};
