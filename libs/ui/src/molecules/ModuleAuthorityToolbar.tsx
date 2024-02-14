import {
  Button,
  Flex,
  HStack,
  Icon,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Stack,
  Text,
  Tooltip,
} from '@chakra-ui/react';
import {
  AUTHORITY_ENFORCEMENT,
  AUTHORITY_TYPES,
} from '@hatsprotocol/constants';
import { HsgType } from '@hatsprotocol/hsg-sdk';
import { hatIdDecimalToIp } from '@hatsprotocol/sdk-v1-core';
import { explorerUrl, getHostnameFromURL } from 'app-utils';
import { useOverlay, useTreeForm } from 'contexts';
import {
  useCallHsgFunction,
  useCallModuleFunction,
  useHsgSigner,
} from 'hats-hooks';
import { Authority, LinkObject } from 'hats-types';
import { formHatUrl, safeUrl } from 'hats-utils';
import _ from 'lodash';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FaEllipsisV, FaExternalLinkAlt } from 'react-icons/fa';
import { FiExternalLink, FiPlusSquare } from 'react-icons/fi';
import { useAccount, useChainId } from 'wagmi';

import { ModuleArgsForm } from '../forms';
import { ChakraNextLink, Modal } from '../index';

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
  const { chainId, selectedHat } = useTreeForm();
  const [selectedFunction, setSelectedFunction] = useState();
  const formMethods = useForm({ mode: 'onChange' });
  const { formState, handleSubmit } = formMethods;
  const currentNetworkId = useChainId();
  const isSameChain = chainId === currentNetworkId;
  const authorityHatId = hatIdDecimalToIp(BigInt(authority?.hatId || '0'));
  const isWearer = useMemo(
    () =>
      _.includes(
        _.map(selectedHat?.wearers, 'id'),
        address?.toLocaleLowerCase(),
      ),
    [selectedHat, address],
  );
  const primaryFunction = _.find(_.get(authority, 'functions'), 'primary');

  const otherFunctions = _.filter(
    _.get(authority, 'functions', []),
    (func: any) => !func.primary,
  );

  const otherLinks = useMemo(() => {
    const links: any[] = [];
    if (!authority) return links;

    if (authority.type === AUTHORITY_TYPES.hsg) {
      links.push({
        link: `${explorerUrl(chainId)}/address/${authority.instanceAddress}`,
        label: 'Go to HatsSignerGate',
      });

      if (authority.signerHats) {
        _.forEach(authority.signerHats, (h) => {
          links.push({
            link: formHatUrl({ hatId: h.id, chainId }),
            label: `Go to Signer Hat (#${hatIdDecimalToIp(BigInt(h.id))})`,
            icon: FaExternalLinkAlt,
          });
        });
      }
      if (authority.ownerHat) {
        links.push({
          link: formHatUrl({ hatId: authority.ownerHat.id, chainId }),
          label: `Go to Owner Hat (#${hatIdDecimalToIp(
            BigInt(authority.ownerHat.id),
          )})`,
          icon: FaExternalLinkAlt,
        });
      }
    }
    if (authority.type === AUTHORITY_TYPES.modules) {
      const hatId = hatIdDecimalToIp(BigInt(authority.hatId || '0'));
      const treeId = _.first(hatId.split('.'));
      links.push({
        link: `/trees/${chainId}/${treeId}?hatId=${hatId}`,
        label: `Go to Hat #${hatId}`,
      });
    }
    return links;
  }, [authority, chainId]);

  const { mutate: callModuleFunction, isLoading: isModuleLoading } =
    useCallModuleFunction({
      chainId,
    });

  const { mutate: callHsgFunction, isLoading: isHsgLoading } =
    useCallHsgFunction({
      chainId,
    });

  const handleFunctionCall = (func) => {
    if (!authority) return;
    if (func.args && func.args.length > 0) {
      setSelectedFunction(func);
      setModals?.({ [`functionCall-${authority.label}-${index}`]: true });
    } else if (authority.type === AUTHORITY_TYPES.modules) {
      callModuleFunction({
        moduleId: authority.moduleAddress,
        instance: authority.instanceAddress,
        func,
        args: [],
      });
    } else {
      callHsgFunction({
        func,
        args: [],
        instance: authority.instanceAddress,
        type: authority.type as HsgType,
      });
    }
  };

  const onSubmit = (args: any) => {
    if (!authority || !selectedFunction) return;
    if (authority.type === AUTHORITY_TYPES.modules) {
      const localArgs = args;
      // ! workaround for hat being an arg on Passthrough module
      if (
        !_.isEmpty(_.filter(_.get(selectedFunction, 'args'), { name: 'Hat' }))
      ) {
        localArgs.Hat = authority?.hatId;
      }
      callModuleFunction({
        instance: authority.instanceAddress,
        func: selectedFunction || undefined,
        args: localArgs,
        moduleId: authority.moduleAddress,
        onSuccess: () => {
          setModals?.({ [`functionCall-${authority.label}-${index}`]: false });
        },
      });
    } else {
      callHsgFunction({
        instance: authority.instanceAddress,
        func: selectedFunction || undefined,
        args,
        type: authority.type as HsgType,
        onSuccess: () => {
          setModals?.({ [`functionCall-${authority.label}-${index}`]: false });
        },
      });
    }
  };

  const { data: claimed } = useHsgSigner({
    instance: authority?.instanceAddress,
    signer: address,
    chainId,
    enabled: authority?.type === AUTHORITY_TYPES.hsg,
  });

  const getDisabledReason = (
    isOnWrongNetwork: boolean,
    isNotWearer: boolean,
    isClaimed: boolean,
  ) => {
    if (isOnWrongNetwork) {
      return 'You are on the wrong network';
    }
    if (isNotWearer) {
      return 'You are not a wearer of the current hat';
    }
    if (isClaimed) {
      return 'You are already a signer';
    }
    return '';
  };

  const isDisabled = !isWearer || !isSameChain;
  const isPrimaryFunctionDisabled =
    (isDisabled ||
      (primaryFunction?.functionName === 'claimSigner' && claimed)) &&
    !primaryFunction?.isCustom;
  const primaryDisabledReason = getDisabledReason(
    !isSameChain,
    !isWearer,
    primaryFunction?.functionName === 'claimSigner' && !!claimed,
  );
  const otherDisabledReason = getDisabledReason(!isSameChain, !isWearer, false);

  if (!authority) return null;

  return (
    <HStack mb={4} wrap='wrap'>
      {primaryFunction && (
        <Tooltip label={primaryDisabledReason}>
          <Button
            colorScheme='blue'
            isDisabled={!!isPrimaryFunctionDisabled}
            size='sm'
            onClick={() => handleFunctionCall(primaryFunction)}
            rightIcon={<Icon as={FiPlusSquare} />}
          >
            {_.capitalize(primaryFunction.label)}
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
              rightIcon={<Icon as={FiExternalLink} />}
              variant='outline'
              color='blue.500'
            >
              Go to {AUTHORITY_ENFORCEMENT[authority.type].name}
            </Button>
          </ChakraNextLink>
        )}
        {authority?.type === AUTHORITY_TYPES.wallet && (
          <ChakraNextLink
            href={`${explorerUrl(chainId)}/address/${
              authority.instanceAddress
            }`}
            isExternal
          >
            <Button
              colorScheme='blue.500'
              size='sm'
              rightIcon={<Icon as={FiExternalLink} />}
              variant='outline'
              color='blue.500'
            >
              Go to {AUTHORITY_ENFORCEMENT[authority.type].name}
            </Button>
          </ChakraNextLink>
        )}
        {authority.type === AUTHORITY_TYPES.hsg && (
          <ChakraNextLink href={safeUrl(chainId, authority.safe)} isExternal>
            <Button variant='outlineMatch' colorScheme='blue.500' size='sm'>
              <HStack>
                <Text>Go to Safe</Text>
                <Icon as={FaExternalLinkAlt} boxSize={3} />
              </HStack>
            </Button>
          </ChakraNextLink>
        )}
        {!_.isEmpty(otherFunctions) && (
          <Menu>
            <MenuButton
              as={IconButton}
              icon={<Icon as={FaEllipsisV} w={2} color='blue.500' />}
              borderColor='blue.500'
              variant='outline'
              size='sm'
            />
            <MenuList>
              {_.map(otherFunctions, (func: any, i: number) => (
                <Tooltip label={otherDisabledReason} key={`${func.label}-${i}`}>
                  <MenuItem
                    onClick={() => {
                      if (func.isCustom) func.onClick();
                      else handleFunctionCall(func);
                    }}
                    isDisabled={isDisabled && !func.isCustom}
                  >
                    <Flex
                      justify='space-between'
                      align='center'
                      w='100%'
                      gap={1}
                    >
                      <Text>{func.label}</Text>
                      <Icon as={func.icon || FiPlusSquare} boxSize={4} />
                    </Flex>
                  </MenuItem>
                </Tooltip>
              ))}
              {_.map(otherLinks, (link: LinkObject) => (
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
      <Modal
        name={`functionCall-${authority?.label}-${index}`}
        title={`${_.capitalize(
          _.get(selectedFunction, 'label'),
        )} for Hat #${authorityHatId}`}
        localOverlay={localOverlay}
      >
        <Stack spacing={6} as='form' onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={1}>
            {_.get(selectedFunction, 'description') && (
              <Text>{_.get(selectedFunction, 'description')}</Text>
            )}
          </Stack>

          <Stack>
            <ModuleArgsForm
              selectedModuleArgs={_.get(selectedFunction, 'args', [])}
              localForm={formMethods}
              hideIcon
              noMargin
              isDeploy={false}
              // ? need `tokenAddress` ?
            />
          </Stack>
          <Flex justify='flex-end'>
            <HStack>
              <Button variant='outline' onClick={() => setModals?.({})}>
                Cancel
              </Button>
              <Button
                colorScheme='blue'
                type='submit'
                isDisabled={!formState.isValid}
                isLoading={isModuleLoading || isHsgLoading}
              >
                {_.capitalize(_.get(selectedFunction, 'label'))}
              </Button>
            </HStack>
          </Flex>
        </Stack>
      </Modal>
    </HStack>
  );
};

export default ModuleAuthorityToolbar;
