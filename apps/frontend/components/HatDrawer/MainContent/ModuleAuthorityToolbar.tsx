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
  ModalFooter,
  Stack,
  Text,
  Tooltip,
} from '@chakra-ui/react';
import { hatIdDecimalToIp } from '@hatsprotocol/sdk-v1-core';
import { AUTHORITIES } from 'app-constants';
import {
  createHatsSignerGateClient,
  explorerUrl,
  getHostnameFromURL,
} from 'app-utils';
import { useCallHsgFunction, useCallModuleFunction } from 'hats-hooks';
import { Authority, LinkObject } from 'hats-types';
import { formHatUrl, safeUrl } from 'hats-utils';
import _ from 'lodash';
import React, { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FaEllipsisV, FaExternalLinkAlt } from 'react-icons/fa';
import { FiExternalLink, FiPlusSquare } from 'react-icons/fi';
import { useAccount, useChainId } from 'wagmi';

import { useOverlay } from '../../../contexts/OverlayContext';
import { useTreeForm } from '../../../contexts/TreeFormContext';
import ChakraNextLink from '../../atoms/ChakraNextLink';
import Modal from '../../atoms/Modal';
import ModuleArgsInputs from '../../ModuleArgsForm';

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
  const { formState } = formMethods;
  const currentNetworkId = useChainId();
  const isSameChain = chainId === currentNetworkId;
  const isWearing = useMemo(
    () =>
      _.includes(
        _.map(selectedHat?.wearers, 'id'),
        address?.toLocaleLowerCase(),
      ),
    [selectedHat, address],
  );
  const [claimedAndValid, setClaimedAndValid] = useState(null);
  const primaryFunction = authority.functions.find((func) => func.primary);
  const otherFunctions = authority.functions.filter((func) => !func.primary);

  const otherLinks = useMemo(() => {
    const links = [];
    if (authority.type === 'hsg') {
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

  const isWearer = useMemo(
    () =>
      _.includes(
        _.map(selectedHat?.wearers, 'id'),
        address?.toLocaleLowerCase(),
      ),
    [selectedHat, address],
  );

  const handleFunctionCall = (func) => {
    if (func.args && func.args.length > 0) {
      setSelectedFunction(func);
      setModals?.({ [`functionCall-${authority.label}-${index}`]: true });
    } else if (authority.type === 'modules') {
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
        type: authority.hgsType,
      });
    }
  };

  const handleSubmit = (args) => {
    if (authority.type === 'modules') {
      callModuleFunction({
        instance: authority.instanceAddress,
        func: selectedFunction,
        args,
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
        type: authority.hgsType,
        onSuccess: () => {
          setModals?.({ [`functionCall-${authority.label}-${index}`]: false });
        },
      });
    }
  };

  useEffect(() => {
    const checkClaimedSignerRights = async () => {
      const signerGateClient = await createHatsSignerGateClient(chainId);
      if (!signerGateClient) throw new Error('Failed to create module client');

      try {
        const result = await signerGateClient.claimedAndStillValid({
          instance: authority.instanceAddress,
          address,
        });
        setClaimedAndValid(result);
      } catch (e) {
        console.error(e);
      }
    };

    if (authority.type === 'hsg') checkClaimedSignerRights();
  }, [chainId, authority, address]);

  return (
    <HStack mb={4} wrap='wrap'>
      {primaryFunction && (
        <Tooltip
          label={
            // eslint-disable-next-line no-nested-ternary
            primaryFunction.functionName === 'claimSigner' && !isWearing
              ? 'You are not wearing the hat'
              : claimedAndValid
              ? 'Signer rights have already been claimed'
              : ''
          }
        >
          <Button
            colorScheme='blue'
            isDisabled={
              !isWearer ||
              !isSameChain ||
              (primaryFunction.functionName === 'claimSigner' &&
                (!isWearing || claimedAndValid))
            }
            size='sm'
            onClick={() => handleFunctionCall(primaryFunction)}
            rightIcon={<Icon as={FiPlusSquare} />}
          >
            {primaryFunction.label}
          </Button>
        </Tooltip>
      )}
      {authority.type === 'modules' && (
        <ChakraNextLink
          href={`${explorerUrl(chainId)}/address/${authority.instanceAddress}`}
          isExternal
        >
          <Button
            colorScheme='blue.500'
            size='sm'
            rightIcon={<Icon as={FiExternalLink} />}
            variant='outline'
            color='blue.500'
          >
            Go to {AUTHORITIES[authority.type].name}
          </Button>
        </ChakraNextLink>
      )}
      {authority.type === 'hsg' && (
        <ChakraNextLink href={safeUrl(chainId, authority.safe)}>
          <Button variant='outlineMatch' colorScheme='blue.500' size='sm'>
            <HStack>
              <Text> Go to Safe</Text>
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
            {_.map(otherFunctions, (func, i) => (
              <MenuItem
                key={`${func.label}-${i}`}
                onClick={() => handleFunctionCall(func)}
                isDisabled={!isWearer || !isSameChain}
              >
                <Flex justify='space-between' align='center' w='100%' gap={1}>
                  <Text>{func.label}</Text>
                  <Icon as={FiPlusSquare} boxSize={4} />
                </Flex>
              </MenuItem>
            ))}
            {_.map(otherLinks, (link: LinkObject) => (
              <ChakraNextLink
                href={link.link}
                isExternal={!!getHostnameFromURL(link.link)}
              >
                <MenuItem>
                  <Flex justify='space-between' align='center' w='100%' gap={1}>
                    <Text>{link.label}</Text>
                    <Icon as={link.icon || FaExternalLinkAlt} boxSize={3} />
                  </Flex>
                </MenuItem>
              </ChakraNextLink>
            ))}
          </MenuList>
        </Menu>
      )}

      <Modal
        name={`functionCall-${authority.label}-${index}`}
        title={selectedFunction?.label}
        localOverlay={localOverlay}
        size='md'
      >
        {selectedFunction?.description && (
          <Text mb={3}>{selectedFunction?.description}</Text>
        )}
        <Text>{authority.label}</Text>
        <Stack>
          <ModuleArgsInputs
            selectedModuleArgs={selectedFunction?.args}
            localForm={formMethods}
            // ? need `tokenAddress` ?
          />
        </Stack>
        <ModalFooter px={0}>
          <HStack>
            <Button variant='outline' onClick={() => setModals({})}>
              Cancel
            </Button>
            <Button
              colorScheme='blue'
              onClick={formMethods.handleSubmit(handleSubmit)}
              isDisabled={!formState.isValid}
              isLoading={isModuleLoading || isHsgLoading}
            >
              {selectedFunction?.label}
            </Button>
          </HStack>
        </ModalFooter>
      </Modal>
    </HStack>
  );
};

export default ModuleAuthorityToolbar;
