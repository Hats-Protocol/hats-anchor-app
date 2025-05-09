'use client';

import { AUTHORITY_ENFORCEMENT, AUTHORITY_PLATFORMS } from '@hatsprotocol/constants';
import { hatIdDecimalToIp, hatIdHexToDecimal } from '@hatsprotocol/sdk-v1-core';
import { useSelectedHat, useTreeForm } from 'contexts';
import { useAllWearers, useHatDetails, useManyHatsDetails } from 'hats-hooks';
import { currentHsgThreshold } from 'hats-utils';
import { useMediaStyles, useSafeDetails } from 'hooks';
import { BoxArrowUpRightOut } from 'icons';
import { find, get, includes, join, keys, map, pick, reject, toLower } from 'lodash';
import posthog from 'posthog-js';
import { useMemo } from 'react';
import { Authority, HatWearer } from 'types';
import { cn, IconHandler, Link, Tooltip } from 'ui';
import { authorityImageHandler, getHostnameFromURL, validateURL } from 'utils';
import { Hex } from 'viem';

const HOSTNAME_LABELS = {
  'charmverse.io': 'Charmverse',
  'telegram.me': 'Telegram',
  'deform.cc': 'Deform',
  'github.com': 'GitHub',
  'twitter.com': 'Twitter',
  'discord.com': 'Discord',
  'medium.com': 'Medium',
  'paragraph.xyz': 'Paragraph',
  'substack.com': 'Substack',
  'mirror.xyz': 'Mirror',
  'admin.daohaus.fun': 'DAOhaus',
};

const getHostnameLabel = (hostname: string) => {
  const hostnameLabel = find(keys(HOSTNAME_LABELS), (k: string) => hostname.includes(k));
  if (!hostnameLabel) return undefined;
  return HOSTNAME_LABELS[hostnameLabel as keyof typeof HOSTNAME_LABELS];
};

const AuthorityHeader = ({ authority, editingItem, isExpanded, totalMaxSupply }: AuthorityHeaderProps) => {
  const { label, link, type, hsgConfig } = pick(authority, ['label', 'link', 'type', 'hsgConfig']);
  const {
    label: currentLabel,
    imageUrl: currentImageUrl,
    link: currentLink,
  } = pick(editingItem, ['label', 'imageUrl', 'link']);
  const { chainId, editMode } = useTreeForm();
  const { selectedHat } = useSelectedHat();
  const { isMobile } = useMediaStyles();

  const localLink = editingItem ? currentLink : link;
  const authorityEnforcement = type
    ? AUTHORITY_ENFORCEMENT[type as keyof typeof AUTHORITY_ENFORCEMENT]
    : AUTHORITY_ENFORCEMENT.manual;
  const authorityEnforcementLabel = find(
    keys(AUTHORITY_PLATFORMS),
    (k: string) => localLink?.includes(toLower(k)) || localLink?.includes(toLower(k)),
  );
  const currentAuthorityEnforcement = authorityEnforcementLabel
    ? AUTHORITY_PLATFORMS[authorityEnforcementLabel as string]
    : undefined;

  // set current image
  const { icon, imageUrl } = authorityImageHandler({
    authority,
    editingItem,
    authorityEnforcement,
    currentImageUrl,
  });

  const { data: safeOwners } = useSafeDetails({
    safeAddress: get(hsgConfig, 'safe'),
    chainId,
    editMode,
  });

  // TODO check how well this handles lots of wearers, assuming low wearer hats for now
  const { wearers: allWearers } = useAllWearers({ selectedHat, chainId });

  const eligibleSigners = useMemo(() => {
    if (!safeOwners || !allWearers) return undefined;

    const wearersLowercased = map(allWearers, (wearer: HatWearer) => toLower(wearer.id)) as unknown as Hex[];

    return reject(safeOwners, (owner: Hex) => !includes(wearersLowercased, toLower(owner)));
  }, [safeOwners, allWearers]);

  const hsgThresholdText = currentHsgThreshold({
    authority,
    hsgConfig,
    eligibleSigners,
    totalMaxSupply,
  });
  const { data: signerHatDetails } = useManyHatsDetails({
    hats: get(hsgConfig, 'signerHats'),
    chainId,
  });
  const signerHatsNames = useMemo(() => {
    const detailsMetadata = map(signerHatDetails, 'detailsMetadata');
    const details = map(detailsMetadata, (metadata) => {
      if (!metadata) return undefined;
      try {
        return JSON.parse(metadata);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error parsing details metadata', error);
      }
    });
    const names = map(details, 'data.name');
    return ` for ${join(names, ', ')}`;
  }, [signerHatDetails]);

  const enforcementIcon =
    authority?.type && AUTHORITY_ENFORCEMENT[authority.type as keyof typeof AUTHORITY_ENFORCEMENT].enforcementIcon;

  return (
    <div className='flex w-full items-center justify-between gap-4'>
      <div className='flex items-start gap-2'>
        <div className='relative flex h-6 w-6 items-center justify-center'>
          {!isExpanded && (
            <img src={enforcementIcon} alt='authority enforcement indicator' className='absolute left-0 top-[1px]' />
          )}

          <IconHandler
            icon={icon}
            authorityEnforcement={currentAuthorityEnforcement || authorityEnforcement}
            imageUrl={imageUrl}
            isExpanded={isExpanded || false}
          />
        </div>

        <div className='text-left'>
          <div className='flex items-center gap-1'>
            {typeof label !== 'string' ? (
              label
            ) : (
              <p
                className={cn(
                  'font-light',
                  isExpanded ? (isMobile ? 'font-bold' : 'font-normal') : undefined,
                  'max-w-[640px] truncate',
                )}
              >
                {hsgThresholdText || currentLabel || label || 'New Authority'}
                {signerHatsNames}
              </p>
            )}
          </div>
        </div>
      </div>
      {!isExpanded && !isMobile && localLink && validateURL(localLink) && (
        <Link
          isExternal
          href={localLink}
          className='block'
          onClick={() => {
            posthog.capture('Clicked Authority Link', {
              authority: label,
              link: localLink,
              label: getHostnameLabel(getHostnameFromURL(localLink)),
            });
          }}
        >
          <Tooltip label={getHostnameFromURL(localLink)}>
            <div className='text-functional-link-primary flex items-center gap-1'>
              <p className='text-sm'>{getHostnameLabel(getHostnameFromURL(localLink))}</p>
              <BoxArrowUpRightOut className='h-3 w-3' />
            </div>
          </Tooltip>
        </Link>
      )}
    </div>
  );
};

interface AuthorityHeaderProps {
  authority: Authority | undefined;
  editingItem?: Authority;
  isExpanded?: boolean;
  totalMaxSupply?: number;
}

export { AuthorityHeader };
