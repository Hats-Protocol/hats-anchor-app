'use client';

import {
  As,
  Button,
  Flex,
  HStack,
  Icon,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
  Tooltip,
} from '@chakra-ui/react';
import {
  AUTHORITY_ENFORCEMENT,
  AUTHORITY_TYPES,
} from '@hatsprotocol/constants';
import { HsgType } from '@hatsprotocol/hsg-sdk';
import { WriteFunction } from '@hatsprotocol/modules-sdk';
import { hatIdDecimalToIp, hatIdToTreeId } from '@hatsprotocol/sdk-v1-core';
import { useOverlay, useSelectedHat, useTreeForm } from 'contexts';
import { ModuleAuthorityModal } from 'forms';
import { useWearerDetails } from 'hats-hooks';
import { formHatUrl, safeUrl } from 'hats-utils';
import {
  capitalize,
  filter,
  find,
  forEach,
  get,
  includes,
  isEmpty,
  map,
  size,
} from 'lodash';
import {
  useCallHsgFunction,
  useCallModuleFunction,
  useHsgSigner,
} from 'modules-hooks';
import dynamic from 'next/dynamic';
import posthog from 'posthog-js';
import { useMemo, useState } from 'react';
import { IconType } from 'react-icons';
import { FaEllipsisV, FaExternalLinkAlt } from 'react-icons/fa';
import { FiPlusSquare } from 'react-icons/fi';
import { Authority, LinkObject, ModuleFunction } from 'types';
import { ChakraNextLink } from 'ui';
import { explorerUrl, getDisabledReason, getHostnameFromURL } from 'utils';
import { Hex } from 'viem';
import { useAccount, useChainId } from 'wagmi';

const BoxArrowUpRightOut = dynamic(() =>
  import('icons').then((i) => i.BoxArrowUpRightOut),
);

const ModuleAuthorityToolbar = ({
  authority,
  index,
}: {
  authority: Authority | undefined;
  index: number;
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
  console.log(
    wearerDetails,
    map(wearerDetails, 'id'),
    selectedHat?.id,
    includes(map(wearerDetails, 'id'), selectedHat?.id),
  );
  const isWearer = useMemo(
    // TODO handle wearers of many hats
    () => includes(map(wearerDetails, 'id'), selectedHat?.id),
    [wearerDetails, selectedHat?.id],
  );
  console.log({ isWearer });
  const primaryFunction = find(get(authority, 'functions'), 'primary');

  const otherFunctions = filter(
    get(authority, 'functions', []),
    (func: WriteFunction) => !func.primary,
  );

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
          label: `Go to Owner Hat (#${hatIdDecimalToIp(
            BigInt(authority.hsgConfig.ownerHat.id),
          )})`,
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
          instance: authority.instanceAddress,
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
        instance: authority.instanceAddress,
        func,
        args: [],
      });
      return;
    }
    if (authority.type === AUTHORITY_TYPES.hsg) {
      callHsgFunction({
        func,
        args: [],
        instance: authority.instanceAddress,
        type: authority.type as HsgType,
      });
    }
  };

  const { data: claimed } = useHsgSigner({
    instance: authority?.instanceAddress,
    signer: address as Hex,
    chainId,
    enabled: authority?.type === AUTHORITY_TYPES.hsg,
  });

  const isDisabled = !isWearer || !isSameChain || !address;
  const isPrimaryFunctionDisabled =
    isDisabled ||
    (primaryFunction?.functionName === 'claimSigner' &&
      claimed &&
      !primaryFunction?.isCustom);
  const primaryDisabledReason = getDisabledReason({
    isNotConnected: !address,
    isOnWrongNetwork: !isSameChain,
    isNotWearer: !isWearer,
    isClaimed: primaryFunction?.functionName === 'claimSigner' && !!claimed,
    isCustom: primaryFunction?.isCustom || false,
  });

  if (!authority) return null;

  const trackSafeClick = () => {
    posthog.capture('Viewed Safe', {
      chain_id: chainId,
      safe: authority.hsgConfig?.safe,
    });
  };

  return (
    <HStack wrap='wrap'>
      {primaryFunction && (
        <Tooltip label={primaryDisabledReason}>
          <Button
            colorScheme='blue'
            isDisabled={!!isPrimaryFunctionDisabled}
            size='sm'
            onClick={() => {
              posthog.capture('Called Module Function', {
                type: 'Primary',
                function: primaryFunction.label,
                authority: authority.label,
              });
              handleFunctionCall(primaryFunction);
            }}
            rightIcon={<Icon as={FiPlusSquare} />}
          >
            {capitalize(primaryFunction.label)}
          </Button>
        </Tooltip>
      )}
      <HStack>
        {authority?.type === AUTHORITY_TYPES.modules && (
          <ChakraNextLink
            href={`${explorerUrl(chainId)}/address/${
              authority.instanceAddress
            }`}
            isExternal
          >
            <Button
              colorScheme='blue.500'
              size='sm'
              rightIcon={<Icon as={BoxArrowUpRightOut} boxSize={3} />}
              variant='outline'
              color='blue.500'
              onClick={() => {
                posthog.capture('Viewed Module', {
                  chain_id: chainId,
                  address: authority.instanceAddress,
                  name: authority.moduleLabel,
                });
              }}
            >
              Go to {get(AUTHORITY_ENFORCEMENT, `${authority.type}.name`)}
            </Button>
          </ChakraNextLink>
        )}
        {authority?.type === AUTHORITY_TYPES.account && (
          <ChakraNextLink
            href={`${explorerUrl(chainId)}/address/${
              authority.instanceAddress
            }`}
            isExternal
          >
            <Button
              colorScheme='blue.500'
              size='sm'
              rightIcon={<Icon as={BoxArrowUpRightOut} boxSize={3} />}
              variant='outline'
              color='blue.500'
              onClick={() => {
                posthog.capture('Viewed HatsAccount', {
                  chain_id: chainId,
                  address: authority.instanceAddress,
                  account: authority.label,
                });
              }}
            >
              Go to{' '}
              {
                AUTHORITY_ENFORCEMENT[
                  authority.type as keyof typeof AUTHORITY_ENFORCEMENT
                ].name
              }
            </Button>
          </ChakraNextLink>
        )}
        {authority.type === AUTHORITY_TYPES.hsg && (
          <ChakraNextLink
            href={safeUrl(chainId, authority.hsgConfig?.safe)}
            onClick={trackSafeClick}
            isExternal
          >
            <Button variant='outlineMatch' colorScheme='blue.500' size='sm'>
              <HStack>
                <Text>Safe</Text>
                <Icon as={BoxArrowUpRightOut} boxSize={3} />
              </HStack>
            </Button>
          </ChakraNextLink>
        )}
        {(!isEmpty(otherFunctions) || !isEmpty(otherLinks)) && (
          <Menu>
            <MenuButton
              as={IconButton}
              icon={<Icon as={FaEllipsisV} w={2} color='blue.500' />}
              borderColor='blue.500'
              variant='outline'
              size='sm'
            />
            <MenuList>
              {map(otherFunctions, (func: ModuleFunction, i: number) => {
                const publicFunction = includes(func.roles, 'public');
                const localDisabledReason = getDisabledReason({
                  isNotConnected: !address,
                  isOnWrongNetwork: !isSameChain,
                  isNotWearer: !isWearer,
                  publicFunction,
                });

                return (
                  <Tooltip
                    label={localDisabledReason}
                    key={`${func.label}-${i}`}
                  >
                    <MenuItem
                      onClick={() => {
                        posthog.capture('Called Module Function', {
                          type: 'Other',
                          function: func.label,
                          authority: authority.label,
                        });
                        if (func.isCustom) func.onClick();
                        else handleFunctionCall(func);
                      }}
                      isDisabled={
                        isDisabled && !func.isCustom && !publicFunction
                      }
                    >
                      <Flex
                        justify='space-between'
                        align='center'
                        w='100%'
                        gap={1}
                      >
                        <Text>{func.label}</Text>
                        <Icon
                          as={(func.icon || FiPlusSquare) as As}
                          boxSize={4}
                        />
                      </Flex>
                    </MenuItem>
                  </Tooltip>
                );
              })}
              {map(otherLinks, (link: LinkObject) => (
                <ChakraNextLink
                  href={link.link}
                  isExternal={!!getHostnameFromURL(link.link)}
                  key={link.link}
                >
                  <MenuItem>
                    <Flex
                      justify='space-between'
                      align='center'
                      w='100%'
                      gap={1}
                    >
                      <Text>{link.label}</Text>
                      <Icon as={link.icon || FaExternalLinkAlt} boxSize={3} />
                    </Flex>
                  </MenuItem>
                </ChakraNextLink>
              ))}
            </MenuList>
          </Menu>
        )}
      </HStack>

      <ModuleAuthorityModal
        authority={authority}
        selectedFunction={selectedFunction}
        index={index}
      />
    </HStack>
  );
};

export default ModuleAuthorityToolbar;
