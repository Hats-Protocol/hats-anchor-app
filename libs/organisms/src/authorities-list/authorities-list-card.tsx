'use client';

import { AUTHORITY_ENFORCEMENT, AUTHORITY_TYPES } from '@hatsprotocol/constants';
import { useSelectedHat, useTreeForm } from 'contexts';
import { useManyHatsDetails } from 'hats-hooks';
import { useMediaStyles } from 'hooks';
import { BoxArrowUpRightOut, CheckCircle } from 'icons';
import { get, includes, map, pick, size, sum, toNumber } from 'lodash';
import { HSGDetails, ModuleCardDetails } from 'modules-ui';
import { AuthorityHeader } from 'molecules';
import posthog from 'posthog-js';
import { BsInfoCircle } from 'react-icons/bs';
import { FaExternalLinkAlt } from 'react-icons/fa';
import { Authority, AuthorityType } from 'types';
import { AccordionContent, AccordionItem, AccordionTrigger, Button, cn, Link, Markdown, Skeleton, Tooltip } from 'ui';
import { getHostnameFromURL, validateURL } from 'utils';

import { ModuleAuthorityToolbar } from './module-authority-toolbar';

const AuthoritiesListCard = ({
  authority,
  type,
  openCards,
  index,
}: {
  authority?: Authority;
  type: AuthorityType;
  openCards: string[];
  index: number;
}) => {
  const { label, description, link, gate, strategies, hatId, hsgConfig } = pick(authority, [
    'label',
    'description',
    'link',
    'gate',
    'strategies',
    'hsgConfig',
    'hatId',
  ]);
  const expanded = includes(openCards, `${authority?.label}-${authority?.id}`);

  const gateHostName = getHostnameFromURL(gate);
  const linkHostName = getHostnameFromURL(link);
  const { isMobile } = useMediaStyles();
  const { chainId } = useTreeForm();
  const { selectedHat } = useSelectedHat();

  const { data: signerHatsDetails } = useManyHatsDetails({
    hats: hsgConfig?.signerHats,
    chainId,
  });
  const hsgTotalMaxSupply = sum(map(signerHatsDetails, (hat) => toNumber(hat.maxSupply)));

  // consolidate with util in AuthorityHeader
  const discordHosts = ['discord.gg', 'discord.com'];
  let linkName = '';
  if (includes(discordHosts, linkHostName)) {
    linkName = 'Go to Discord';
  } else if (linkHostName === 'docs.google.com') {
    linkName = 'Open Doc';
  } else if (linkHostName === 'github.com') {
    linkName = 'Go to Repo';
  } else if (linkHostName === 'snapshot.org') {
    linkName = 'Go to Space';
  }

  const displayModulesToolbar =
    type === AUTHORITY_TYPES.modules || type === AUTHORITY_TYPES.hsg || type === AUTHORITY_TYPES.account;

  const authorityEnforcement = type ? AUTHORITY_ENFORCEMENT[type] : AUTHORITY_ENFORCEMENT.manual;

  // set tooltip info
  // TODO refactor to util/hook
  let tooltipInfo = authorityEnforcement?.info;
  if (strategies) {
    tooltipInfo = `Automatically pulled in from Snapshot. Voting weight in ${size(
      strategies,
    )} ${size(strategies) === 1 ? 'strategy.' : 'strategies.'}`;
  }
  if (type === AUTHORITY_TYPES.modules && hatId) {
    tooltipInfo = `Connected onchain via the ${label}`; //  module for Hat #${hatIdDecimalToIp(BigInt(hatId))}
  }

  const handleToggle = () => {
    posthog.capture('Toggled Authority', {
      label,
      is_open: expanded,
    });
  };

  if (authority?.label === 'Loading...') {
    return <Skeleton className='h-6' />;
  }

  if (!gate && !description && type !== AUTHORITY_TYPES.modules && type !== AUTHORITY_TYPES.hsg) {
    return (
      <div className='flex px-4 py-2 md:px-0'>
        <AuthorityHeader authority={authority} />
      </div>
    );
  }

  // TODO make enforcement tooltip work as a popover on mobile

  // Accordion handled at list level
  if (!authority?.label) return null;

  return (
    <AccordionItem
      value={`${authority.label}-${authority.id}`}
      className={cn(
        'w-full border-none md:ml-[-16px] md:w-[calc(100%+32px)] md:rounded-md',
        expanded ? 'shadow' : undefined,
      )}
      onClick={handleToggle}
    >
      <AccordionTrigger
        className={cn(
          'relative rounded-md border-b border-t border-transparent p-0 px-4 hover:border-t-gray-100 hover:bg-white hover:no-underline focus:border-transparent md:rounded-md',
          !expanded ? 'hover:border-blue-300 hover:border-t-transparent' : 'hover:border-t-gray-100',
          expanded && 'rounded-none border-t-gray-100 bg-white pb-0 md:rounded-t-md',
        )}
      >
        <div className='py-2 text-base'>
          <AuthorityHeader authority={authority} isExpanded={expanded} totalMaxSupply={hsgTotalMaxSupply} />
        </div>
        {/* {isMobile && <AccordionIcon mr={expanded ? 1 : 0} color='blackAlpha.600' />} */}
        {/* {expanded && !isMobile && <Collapse className='absolute bottom-[-2px] right-4 h-4 w-4' />} */}
      </AccordionTrigger>

      <AccordionContent
        // TODO mb-4 on expanded giving a weird jumping effect on transition
        className={cn('p-0 text-base', expanded ? 'rounded-b-md border-b-2 border-b-gray-100 bg-white' : undefined)}
      >
        <div className='flex flex-col gap-2 px-4'>
          <div>
            <div className='flex items-center gap-2'>
              <img src={authorityEnforcement.enforcementIcon} alt='Hat' className='size-6' />
              <div className='flex items-center gap-2'>
                <p>{authorityEnforcement.label}</p>
                {!isMobile && (
                  <Tooltip label={tooltipInfo}>
                    <span>
                      <BsInfoCircle className='size-4 cursor-pointer' />
                    </span>
                  </Tooltip>
                )}
              </div>
            </div>
          </div>

          {displayModulesToolbar ? (
            <ModuleAuthorityToolbar authority={authority} index={index} isExpanded={expanded} />
          ) : (
            <div className={cn('mb-4', description && 'mb-0')}>
              {link && validateURL(link) && (
                <Link href={link} className='block' isExternal>
                  {linkName || linkHostName ? (
                    <Button
                      variant='outline'
                      className='border-functional-link-primary'
                      onClick={() => {
                        posthog.capture('Clicked Authority Link', {
                          authority: label,
                          link,
                          link_name: linkName || linkHostName,
                          is_gate: false,
                        });
                      }}
                      size='sm'
                    >
                      {linkName || linkHostName}
                      <BoxArrowUpRightOut className='ml-1 !size-3' />
                    </Button>
                  ) : (
                    <Button
                      variant='outline'
                      className='border-functional-link-primary'
                      onClick={() => {
                        posthog.capture('Clicked Authority Link', {
                          authority: label,
                          link,
                          label: linkName || linkHostName,
                          is_gate: false,
                        });
                      }}
                      aria-label='Authority Link'
                      size='sm'
                    >
                      <BoxArrowUpRightOut className='ml-1 !size-3' />
                    </Button>
                  )}
                </Link>
              )}
              {gate && validateURL(gate) && (
                <Link href={gate} className='block' isExternal>
                  <Button
                    variant='outline'
                    className='border-functional-link-primary'
                    size='sm'
                    onClick={() => {
                      posthog.capture('Clicked Authority Link', {
                        authority: label,
                        link,
                        link_name: linkName || linkHostName,
                        is_gate: true,
                      });
                    }}
                  >
                    {gateHostName}
                    <FaExternalLinkAlt className='ml-1 size-2' />
                  </Button>
                </Link>
              )}
            </div>
          )}
          {type === AUTHORITY_TYPES.hsg && authority?.hsgConfig && (
            <div className='pb-3 pt-2'>
              <HSGDetails
                hsgConfig={authority.hsgConfig}
                selectedHat={selectedHat}
                chainId={chainId}
                signerHatsDetails={signerHatsDetails}
              />
            </div>
          )}
          {type === AUTHORITY_TYPES.modules && (
            <div className='pb-3 pt-2'>
              <ModuleCardDetails hat={selectedHat} moduleInfo={get(authority, 'moduleInfo')} chainId={chainId} />
            </div>
          )}
          {type !== AUTHORITY_TYPES.modules &&
            description &&
            (typeof description === 'string' ? (
              <div className='pb-3'>
                <Markdown>{description}</Markdown>
              </div>
            ) : (
              <div className={cn('pb-3 pt-2', link || gate ? 'pt-2' : 'pb-3')}>{description}</div>
            ))}
        </div>
        {displayModulesToolbar && (
          <div className='border-b-md mt-2 w-full bg-green-50 px-4 py-1 text-green-600'>
            <div className='flex items-center gap-1'>
              <CheckCircle className='size-4' />
              <p className='text-sm font-medium'>Verified Module</p>
            </div>
          </div>
        )}
      </AccordionContent>
    </AccordionItem>
  );
};

export { AuthoritiesListCard };
