'use client';

import { AUTHORITY_TYPES } from '@hatsprotocol/constants';
import { HsgType } from '@hatsprotocol/hsg-sdk';
import { WriteFunction } from '@hatsprotocol/modules-sdk';
import { hatIdDecimalToIp, hatIdToTreeId } from '@hatsprotocol/sdk-v1-core';
import { useOverlay, useSelectedHat, useTreeForm } from 'contexts';
import { ModuleAuthorityModal } from 'forms';
import { useWearerDetails } from 'hats-hooks';
import { formHatUrl, safeUrl } from 'hats-utils';
import { BoxArrowUpRightOut } from 'icons';
import { capitalize, filter, find, forEach, get, includes, isEmpty, map, size } from 'lodash';
import { useCallHsgFunction, useCallModuleFunction, useHsgSigner } from 'modules-hooks';
import posthog from 'posthog-js';
import { useMemo, useState } from 'react';
import { IconType } from 'react-icons';
import { FaEllipsisV, FaExternalLinkAlt } from 'react-icons/fa';
import { FiPlusSquare } from 'react-icons/fi';
import { Authority, LinkObject, ModuleFunction } from 'types';
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Link,
  LinkButton,
  Tooltip,
} from 'ui';
import { chainIdToString, explorerUrl, getCustomModuleFunction, getDisabledReason, getHostnameFromURL } from 'utils';
import { Hex } from 'viem';
import { useAccount, useChainId } from 'wagmi';

import { CustomFunction } from './custom-function';

const PRO_URL = process.env.NEXT_PUBLIC_PRO_URL || 'https://pro.hatsprotocol.xyz';

const ModuleAuthorityToolbar = ({
  authority,
  index,
  isExpanded,
}: {
  authority: Authority | undefined;
  index: number;
  isExpanded: boolean;
}) => {
  const localOverlay = useOverlay();
  const { address } = useAccount();
  const { setModals } = localOverlay;
  const { chainId } = useTreeForm();
  const { selectedHat } = useSelectedHat();
  const [selectedFunction, setSelectedFunction] = useState<ModuleFunction>();

  const currentNetworkId = useChainId();
  const isSameChain = chainId === currentNetworkId;

  const { data: wearerDetails } = useWearerDetails({
    wearerAddress: address as Hex,
    chainId,
  });

  const isWearer = useMemo(
    // TODO handle wearers of many hats
    () => includes(map(wearerDetails, 'id'), selectedHat?.id),
    [wearerDetails, selectedHat?.id],
  );

  const customFunction = getCustomModuleFunction(authority);
  const primaryFunction = find(get(authority, 'functions'), 'primary');
  const otherFunctions = filter(get(authority, 'functions', []), (func: WriteFunction) => !func.primary);

  const otherLinks = useMemo(() => {
    const links: { link: string; label: string; icon?: IconType }[] = [];
    if (!authority) return links;

    if (authority.type === AUTHORITY_TYPES.hsg) {
      links.push({
        link: `${explorerUrl(chainId)}/address/${authority.instanceAddress}`,
        label: 'Go to HatsSignerGate',
      });

      if (authority.hsgConfig?.signerHats) {
        forEach(authority.hsgConfig.signerHats, (h: { id: Hex }) => {
          links.push({
            link: formHatUrl({ hatId: h.id, chainId }),
            label: `Go to Signer Hat (#${hatIdDecimalToIp(BigInt(h.id))})`,
            icon: FaExternalLinkAlt,
          });
        });
      }
      if (authority.hsgConfig?.ownerHat) {
        links.push({
          link: formHatUrl({ hatId: authority.hsgConfig.ownerHat.id, chainId }),
          label: `Go to Owner Hat (#${hatIdDecimalToIp(BigInt(authority.hsgConfig.ownerHat.id))})`,
          icon: FaExternalLinkAlt,
        });
      }
    }
    if (authority.type === AUTHORITY_TYPES.modules && authority.hatId) {
      const hatId = hatIdDecimalToIp(BigInt(authority.hatId));
      const treeId = hatIdToTreeId(BigInt(authority.hatId));
      links.push({
        link: `/trees/${chainId}/${treeId}?hatId=${hatId}`,
        label: `Go to Hat #${hatId}`,
      });
    }
    return links;
  }, [authority, chainId]);

  const { mutate: callModuleFunction } = useCallModuleFunction({
    chainId,
  });

  const { mutate: callHsgFunction } = useCallHsgFunction({
    chainId,
  });

  const handleFunctionCall = (func: ModuleFunction) => {
    if (!authority) return;
    if (func.isCustom) {
      // prioritize custom functions
      func.onClick();
      return;
    }
    if (func.args && func.args.length > 0) {
      // handle special case for claimSigner on MHSG, might be a better way to handle this to match modules
      if (
        size(func.args) === 1 &&
        get(func, 'args[0].name') === 'Signer Hat' // TODO can we make this assumption in other cases?
      ) {
        const args = { 'Signer Hat': selectedHat?.id };
        callHsgFunction({
          instance: authority.instanceAddress as Hex,
          func,
          args,
          type: 'MHSG', // hardcoded because we're only using this flow for MHSG which has an argument requirement
        });
        return;
      }

      setSelectedFunction(func);
      setModals?.({ [`functionCall-${authority.label}-${index}`]: true });
      return;
    }
    if (authority.type === AUTHORITY_TYPES.modules) {
      callModuleFunction({
        moduleId: authority.moduleAddress,
        instance: authority.instanceAddress as Hex,
        func,
        args: [],
      });
      return;
    }
    if (authority.type === AUTHORITY_TYPES.hsg) {
      callHsgFunction({
        func,
        args: [],
        instance: authority.instanceAddress as Hex,
        type: authority.type as HsgType,
      });
    }
  };

  const { data: claimed } = useHsgSigner({
    instance: authority?.instanceAddress as Hex,
    signer: address as Hex,
    chainId,
    enabled: authority?.type === AUTHORITY_TYPES.hsg,
  });

  const isDisabled = !isWearer || !isSameChain || !address;
  const isPrimaryFunctionDisabled =
    isDisabled || (primaryFunction?.functionName === 'claimSigner' && claimed && !primaryFunction?.isCustom);
  const primaryDisabledReason = getDisabledReason({
    isNotConnected: !address,
    isOnWrongNetwork: !isSameChain,
    isNotWearer: !isWearer,
    isClaimed: primaryFunction?.functionName === 'claimSigner' && !!claimed,
    isCustom: primaryFunction?.isCustom || false,
  });

  if (!authority || !isExpanded) return null;

  const trackSafeClick = () => {
    posthog.capture('Viewed Safe', {
      chain_id: chainId,
      safe: authority.hsgConfig?.safe,
    });
  };

  const eligibilityModalFlag = false;
  // posthog.isFeatureEnabled('eligibility-modal') ||
  // process.env.NODE_ENV === 'development';
  const isMultiSigner = size(authority.hsgConfig?.signerHats) > 1;

  return (
    <div className='flex flex-wrap gap-2'>
      {/* TODO this is a bit hacky and deviates from our convention here. In lieu of a full implementation for write functions we'll set this option only */}
      {authority.hsgConfig?.version === 2 && (
        <LinkButton
          href={`${PRO_URL}/councils/${chainIdToString(chainId || null)}:${authority.instanceAddress}/${isMultiSigner ? 'manage' : 'join'}`}
          size='sm'
        >
          <p className='text-sm'>{isMultiSigner ? 'Manage' : 'Claim'} in Pro</p>
        </LinkButton>
      )}
      {customFunction && eligibilityModalFlag ? <CustomFunction authority={customFunction} /> : null}

      {primaryFunction && (!customFunction || !eligibilityModalFlag) && (
        <Tooltip label={primaryDisabledReason}>
          <Button
            disabled={!!isPrimaryFunctionDisabled}
            size='sm'
            className='text-sm'
            onClick={() => {
              posthog.capture('Called Module Function', {
                type: 'Primary',
                function: primaryFunction.label,
                authority: authority.label,
              });
              handleFunctionCall(primaryFunction);
            }}
          >
            {capitalize(primaryFunction.label)}
            <FiPlusSquare className='ml-1 size-4' />
          </Button>
        </Tooltip>
      )}

      <div className='flex gap-2'>
        {authority.type === AUTHORITY_TYPES.hsg && (
          <Link href={safeUrl(chainId, authority.hsgConfig?.safe)} onClick={trackSafeClick} isExternal>
            <Button variant='outline-blue' className='text-sm' size='sm'>
              <div className='flex items-center gap-1'>
                <p>Safe</p>

                <BoxArrowUpRightOut className='size-3' />
              </div>
            </Button>
          </Link>
        )}
        {(!isEmpty(otherFunctions) || !isEmpty(otherLinks)) && (
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button variant='outline-blue' size='sm' className='text-sm'>
                More
                <FaEllipsisV className='text-functional-link-primary ml-1 size-2' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='start' className='z-[100]'>
              {map(otherFunctions, (func: ModuleFunction, i: number) => {
                const publicFunction = includes(func.roles, 'public');
                const localDisabledReason = getDisabledReason({
                  isNotConnected: !address,
                  isOnWrongNetwork: !isSameChain,
                  isNotWearer: !isWearer,
                  publicFunction,
                });

                const Icon = (func.icon || FiPlusSquare) as IconType;

                return (
                  <Tooltip label={localDisabledReason} key={`${func.label}-${i}`}>
                    <DropdownMenuItem
                      onClick={() => {
                        posthog.capture('Called Module Function', {
                          type: 'Other',
                          function: func.label,
                          authority: authority.label,
                        });
                        if (func.isCustom) func.onClick();
                        else handleFunctionCall(func);
                      }}
                      disabled={isDisabled && !func.isCustom && !publicFunction}
                    >
                      <div className='flex w-full items-center justify-between gap-1'>
                        <p>{func.label}</p>
                        <Icon className='size-4' />
                      </div>
                    </DropdownMenuItem>
                  </Tooltip>
                );
              })}
              {map(otherLinks, (link: LinkObject) => {
                const Icon = link.icon || FaExternalLinkAlt;
                return (
                  <Link
                    href={link.link}
                    isExternal={!!getHostnameFromURL(link.link)}
                    key={link.link}
                    className='text-foreground hover:no-underline'
                  >
                    <DropdownMenuItem>
                      <div className='flex w-full items-center justify-between gap-1'>
                        <p>{link.label}</p>
                        <Icon className='size-3' />
                      </div>
                    </DropdownMenuItem>
                  </Link>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <ModuleAuthorityModal
        authority={authority}
        selectedFunction={selectedFunction}
        setSelectedFunction={setSelectedFunction}
        index={index}
      />
    </div>
  );
};

export { ModuleAuthorityToolbar };
