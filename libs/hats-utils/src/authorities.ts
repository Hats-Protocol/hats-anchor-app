/* eslint-disable import/prefer-default-export */
import { AUTHORITY_TYPES } from '@hatsprotocol/constants';
import { ModuleParameter } from '@hatsprotocol/modules-sdk';
import { Authority, AuthorityType } from 'hats-types';
import _ from 'lodash';

export const combineAuthorities = ({
  authorities,
  guildRoles,
  spaces,
  modulesAuthorities,
}: {
  authorities: Authority[] | undefined;
  guildRoles: Authority[] | undefined;
  spaces: Authority[] | undefined;
  modulesAuthorities: Authority[] | undefined;
}): { data: Authority[] | undefined } => {
  const socialAuthorities = _.map(authorities, (authority: Authority) => ({
    ...authority,
    type: AUTHORITY_TYPES.manual as AuthorityType,
  }));

  // authorities with matching link
  const matchingAuthorities = _.filter(
    socialAuthorities,
    (authority: Authority) =>
      _.includes(_.map(guildRoles, 'link'), authority.link) ||
      _.includes(_.map(spaces, 'link'), authority.link),
  );
  const mergedAuthorities = _.map(
    matchingAuthorities,
    (authority: Authority) => {
      const guildRole = _.find(guildRoles, ['link', authority.link]);
      const guildProps = _.pick(guildRole, ['gate', 'type']);
      const space = _.find(spaces, ['link', authority.link]);
      const spaceProps = _.pick(space, ['gate', 'type']);
      return {
        ...authority,
        ...guildProps,
        ...spaceProps,
      };
    },
  );
  // authorities without matching link
  const nonMatchingAuthorities = _.reject(
    _.concat(guildRoles, spaces),
    (authority: Authority) =>
      _.includes(_.map(socialAuthorities, 'link'), authority?.link),
  );

  // authorities that aren't in guildRoles or spaces
  const filteredAuthorities = _.reject(
    socialAuthorities,
    (authority: Authority) =>
      _.includes(_.map(matchingAuthorities, 'link'), authority.link),
  );

  // combine authorities
  const combined = _.concat(
    mergedAuthorities,
    nonMatchingAuthorities,
    filteredAuthorities,
    modulesAuthorities,
  );

  return { data: _.compact(combined) as Authority[] };
};

export const findCurrentTermEndValue = (parameters: ModuleParameter[]) => {
  if (!parameters) return null;
  const currentTermEndObj = parameters.find(
    (param) => param.label === 'Current Term End',
  );
  return currentTermEndObj
    ? new Date(Number(currentTermEndObj.value) * 1000)
    : null;
};
