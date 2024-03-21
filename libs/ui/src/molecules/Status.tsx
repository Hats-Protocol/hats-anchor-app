import {
  Button,
  Flex,
  Heading,
  HStack,
  Icon,
  IconButton,
  Stack,
  Text,
  Tooltip,
  useClipboard,
} from '@chakra-ui/react';
import { FALLBACK_ADDRESS, MODULE_TYPES } from '@hatsprotocol/constants';
import { hatIdDecimalToIp } from '@hatsprotocol/sdk-v1-core';
import { useSelectedHat, useTreeForm } from 'contexts';
import {
  useHatStatus,
  useModuleDetails,
  useMultiClaimsHatterCheck,
  useWearerDetails,
  useWearerEligibilityCheck,
} from 'hats-hooks';
import { getControllerNameAndLink, isWearingAdminHat } from 'hats-utils';
import { useContractData, usePendHatterMint, useToast } from 'hooks';
import _ from 'lodash';
import { useMemo } from 'react';
import { BsPersonBadge } from 'react-icons/bs';
import { FaBan, FaCheck, FaCode, FaQuestionCircle } from 'react-icons/fa';
import { FiCopy } from 'react-icons/fi';
import { TbCircleOff } from 'react-icons/tb';
import { HatWearer, SupportedChains } from 'types';
import { zeroAddress } from 'viem';
import { useAccount } from 'wagmi';

import { ChakraNextLink } from '../atoms';

const StatusCard = ({ status, label }: { status: string; label: string }) => {
  const { address } = useAccount();
  const {
    chainId,
    storedData,
    setStoredData,
    onchainHats,
    editMode,
    treeToDisplay,
  } = useTreeForm();
  const { selectedHat, hatWearers } = useSelectedHat();

  const { eligibility, toggle } = _.pick(selectedHat, [
    'eligibility',
    'toggle',
  ]);
  const controller = status === MODULE_TYPES.eligibility ? eligibility : toggle;
  const extendedController: HatWearer | undefined = _.find(hatWearers, {
    id: controller,
  });

  const moduleAddress = useMemo(
    () => _.get(selectedHat, _.toLower(status)),
    [selectedHat, status],
  );

  const { data: wearerDetails } = useWearerDetails({
    wearerAddress: address,
    chainId,
  });
  const { details: moduleDetails } = useModuleDetails({
    address: moduleAddress,
    chainId,
  });

  const { instanceAddress, hatterIsAdmin } = useMultiClaimsHatterCheck({
    chainId,
    selectedHat,
    onchainHats,
    storedData,
    editMode,
  });

  const { hatToMintTo, hatToMintPended, pendMintHatForHatter } =
    usePendHatterMint({
      address: instanceAddress,
      treeToDisplay,
      selectedHat,
      storedData,
      setStoredData,
    });

  const { data: isEligible } = useWearerEligibilityCheck({
    wearer: address,
    selectedHat,
    chainId,
  });

  const { data: isActive } = useHatStatus({ selectedHat, chainId });
  const { data: contractData } = useContractData({
    chainId,
    address: extendedController?.id,
    enabled: extendedController?.isContract,
  });

  const { onCopy } = useClipboard(extendedController?.id || '');
  const toast = useToast();

  let statusCheck = true;
  if (status === MODULE_TYPES.eligibility) {
    statusCheck = isEligible;
  } else if (status === MODULE_TYPES.toggle) {
    if (extendedController?.isContract) {
      statusCheck = isActive;
    } else {
      statusCheck = selectedHat?.status || false;
    }
  }

  const isAdmin = isWearingAdminHat(_.map(wearerDetails, 'id'), hatToMintTo);

  let icon = FaCode;
  if (
    extendedController?.id === FALLBACK_ADDRESS ||
    extendedController?.id === zeroAddress
  ) {
    icon = TbCircleOff;
  } else if (!extendedController?.isContract) {
    icon = BsPersonBadge;
  }

  const { controllerName, controllerLink } = getControllerNameAndLink({
    extendedController,
    moduleDetails,
    contractData,
    chainId: chainId as SupportedChains,
  });

  return (
    <Stack px={{ base: 4, md: 10 }}>
      <Flex justifyContent='space-between'>
        <Heading size={{ base: 'sm', md: 'md' }} variant='medium'>
          {_.capitalize(_.toString(status))}
        </Heading>
        <Tooltip
          label={_.get(extendedController, 'id')}
          placement='left'
          minW='400px'
          textAlign='center'
          shouldWrapChildren
          hasArrow
        >
          <HStack>
            <IconButton
              variant='ghost'
              icon={<FiCopy />}
              size='sm'
              onClick={() => {
                onCopy();
                toast.info({
                  title: 'Successfully copied address to clipboard',
                });
              }}
              aria-label='Copy Address'
              color='gray.500'
            />
            <ChakraNextLink href={controllerLink} isExternal>
              <HStack>
                <Icon as={icon} ml={2} w={4} h={4} color='gray.500' />
                <Text variant='gray' size='sm'>
                  {controllerName}
                </Text>
              </HStack>
            </ChakraNextLink>
          </HStack>
        </Tooltip>
      </Flex>
      <Flex justifyContent='space-between'>
        <HStack>
          <Text size={{ base: 'sm', md: 'md' }}>{label}</Text>
        </HStack>

        <HStack color={statusCheck ? 'green.500' : 'red.500'} ml={2}>
          <Text>{statusCheck ? 'Yes' : 'No'}</Text>
          <Icon
            as={statusCheck ? FaCheck : FaBan}
            boxSize={{ base: '14px', md: 4 }}
          />
        </HStack>
      </Flex>
      {moduleDetails &&
        status === MODULE_TYPES.eligibility &&
        _.gt(selectedHat?.levelAtLocalTree, 1) &&
        (!instanceAddress ? (
          <Flex justify='space-between'>
            <Text color='blue.300'>No hatter deployed for tree</Text>

            <Tooltip
              label='Head over to Edit Mode in the Revocation & Eligibility section to deploy a claims hatter for this hat and tree'
              placement='left'
              shouldWrapChildren
            >
              <Icon as={FaQuestionCircle} color='blue.500' />
            </Tooltip>
          </Flex>
        ) : (
          !hatterIsAdmin && (
            <Flex justify='space-between'>
              <Text color='blue.300'>Claims Hatter is not an admin</Text>
              {isAdmin && hatToMintTo ? (
                <Tooltip
                  label={
                    hatToMintPended &&
                    `Mint pended for hatter on hat #${hatIdDecimalToIp(
                      BigInt(hatToMintTo),
                    )} `
                  }
                  placement='left'
                  shouldWrapChildren
                >
                  <Button
                    size='xs'
                    variant='outline'
                    colorScheme='blue.500'
                    isDisabled={!!hatToMintPended}
                    onClick={pendMintHatForHatter}
                  >
                    Mint {hatIdDecimalToIp(BigInt(hatToMintTo))} to hatter
                  </Button>
                </Tooltip>
              ) : (
                <Tooltip
                  label='Ask an admin of claims hatter hat to mint them a hat'
                  placement='left'
                  shouldWrapChildren
                >
                  <Icon as={FaQuestionCircle} color='blue.500' />
                </Tooltip>
              )}
            </Flex>
          )
        ))}
    </Stack>
  );
};

export default StatusCard;
