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
import {
  useCallHsgFunction,
  useCallModuleFunction,
  useHsgSigner,
} from 'hats-hooks';
import { Authority, LinkObject } from 'hats-types';
import { formHatUrl, safeUrl } from 'hats-utils';
import _ from 'lodash';
import React, { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FaEllipsisV, FaExternalLinkAlt } from 'react-icons/fa';
import { FiExternalLink, FiPlusSquare } from 'react-icons/fi';
import { ChakraNextLink, Modal } from 'ui';
import { useAccount, useChainId } from 'wagmi';

import { useOverlay } from '../../../contexts/OverlayContext';
import { useTreeForm } from '../../../contexts/TreeFormContext';
import ModuleArgsForm from '../../ModuleArgsForm';

const ModuleAuthorityToolbar = ({
  authority,
  index,
}: {
  authority: Authority;
  index: number;
}) => {
  const localOverlay = useOverlay();
  const { address } = useAccount();
  const { setModals } = localOverlay;
  const { chainId, selectedHat } = useTreeForm();
  const [selectedFunction, setSelectedFunction] = useState(null);
  const formMethods = useForm({ mode: 'onChange' });
  const { formState, handleSubmit } = formMethods;
  const currentNetworkId = useChainId();
  const isSameChain = chainId === currentNetworkId;
  const authorityHatId = hatIdDecimalToIp(BigInt(authority?.hatId));
  const isWearer = useMemo(
    () =>
      _.includes(
        _.map(selectedHat?.wearers, 'id'),
        address?.toLocaleLowerCase(),
      ),
    [selectedHat, address],
  );
  const primaryFunction = authority.functions.find((func) => func.primary);
  const otherFunctions = authority.functions.filter((func) => !func.primary);

  const otherLinks = useMemo(() => {
    const links = [];
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
      const hatId = hatIdDecimalToIp(BigInt(authority.hatId));
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
    if (authority.type === AUTHORITY_TYPES.modules) {
      const localArgs = args;
      // ! workaround for hat being an arg on Passthrough module
      if (!_.isEmpty(_.filter(selectedFunction.args, { name: 'Hat' }))) {
        localArgs.Hat = authority?.hatId;
      }
      callModuleFunction({
        instance: authority.instanceAddress,
        func: selectedFunction,
        args: localArgs,
        moduleId: authority.moduleAddress,
        onSuccess: () => {
          setModals?.({ [`functionCall-${authority.label}-${index}`]: false });
        },
      });
    } else {
      callHsgFunction({
        instance: authority.instanceAddress,
        func: selectedFunction,
        args,
        type: authority.type as HsgType,
        onSuccess: () => {
          setModals?.({ [`functionCall-${authority.label}-${index}`]: false });
        },
      });
    }
  };

  const { data: claimed } = useHsgSigner({
    instance: authority.instanceAddress,
    signer: address,
    chainId,
    enabled: authority.type === AUTHORITY_TYPES.hsg,
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
    isDisabled || (primaryFunction.functionName === 'claimSigner' && claimed);
  const primaryDisabledReason = getDisabledReason(
    !isSameChain,
    !isWearer,
    primaryFunction.functionName === 'claimSigner' && claimed,
  );
  const otherDisabledReason = getDisabledReason(!isSameChain, !isWearer, false);

  return (
    <HStack mb={4} wrap='wrap'>
      {primaryFunction && (
        <Tooltip label={primaryDisabledReason}>
          <Button
            colorScheme='blue'
            isDisabled={isPrimaryFunctionDisabled}
            size='sm'
            onClick={() => handleFunctionCall(primaryFunction)}
            rightIcon={<Icon as={FiPlusSquare} />}
          >
            {_.capitalize(primaryFunction.label)}
          </Button>
        </Tooltip>
      )}
      <HStack>
        {authority.type === AUTHORITY_TYPES.modules && (
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
                    onClick={() => handleFunctionCall(func)}
                    isDisabled={isDisabled}
                  >
                    <Flex
                      justify='space-between'
                      align='center'
                      w='100%'
                      gap={1}
                    >
                      <Text>{func.label}</Text>
                      <Icon as={FiPlusSquare} boxSize={4} />
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
        name={`functionCall-${authority.label}-${index}`}
        title={`${_.capitalize(
          selectedFunction?.label,
        )} for Hat #${authorityHatId}`} // {`Interact with ${authority.moduleLabel}`}
        localOverlay={localOverlay}
      >
        <Stack spacing={6} as='form' onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={1}>
            {/* <Heading size='sm'>
              {_.capitalize(selectedFunction?.label)} for Hat #{authorityHatId}
            </Heading> */}
            {selectedFunction?.description && (
              <Text>{selectedFunction?.description}</Text>
            )}
          </Stack>

          <Stack>
            <ModuleArgsForm
              selectedModuleArgs={selectedFunction?.args}
              localForm={formMethods}
              hideIcon
              noMargin
              isDeploy={false}
              // ? need `tokenAddress` ?
            />
          </Stack>
          <Flex justify='flex-end'>
            <HStack>
              <Button variant='outline' onClick={() => setModals({})}>
                Cancel
              </Button>
              <Button
                colorScheme='blue'
                type='submit'
                isDisabled={!formState.isValid}
                isLoading={isModuleLoading || isHsgLoading}
              >
                {_.capitalize(selectedFunction?.label)}
              </Button>
            </HStack>
          </Flex>
        </Stack>
      </Modal>
    </HStack>
  );
};

export default ModuleAuthorityToolbar;
