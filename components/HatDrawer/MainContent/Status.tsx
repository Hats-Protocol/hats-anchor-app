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
import { hatIdDecimalToIp } from '@hatsprotocol/sdk-v1-core';
import _ from 'lodash';
import { useMemo } from 'react';
import { BsPersonBadge } from 'react-icons/bs';
import { FaBan, FaCheck, FaCode, FaQuestionCircle } from 'react-icons/fa';
import { FiCopy } from 'react-icons/fi';
import { TbCircleOff } from 'react-icons/tb';
import { useAccount } from 'wagmi';

import ChakraNextLink from '@/components/atoms/ChakraNextLink';
import { FALLBACK_ADDRESS, ZERO_ADDRESS } from '@/constants';
import { MODULE_TYPES } from '@/constants/form';
import { useTreeForm } from '@/contexts/TreeFormContext';
import useHatStatus from '@/hooks/useHatStatus';
import useModuleDetails from '@/hooks/useModuleDetails';
import useMultiClaimsHatterCheck from '@/hooks/useMultiClaimsHatterCheck';
import usePendHatterMint from '@/hooks/usePendHatterMint';
import useToast from '@/hooks/useToast';
import useWearerDetails from '@/hooks/useWearerDetails';
import useWearerEligibilityCheck from '@/hooks/useWearerEligibilityCheck';
import { formatAddress } from '@/lib/general';
import { isWearingAdminHat } from '@/lib/hats';
import { explorerUrl } from '@/lib/web3';

const StatusCard = ({
  status,
  isAContract,
  label,
}: {
  status: string;
  isAContract: boolean;
  label: string;
}) => {
  const { address } = useAccount();
  const { chainId, selectedHat } = useTreeForm();
  const { extendedEligibility, extendedToggle } = _.pick(selectedHat, [
    'extendedEligibility',
    'extendedToggle',
  ]);
  const statusData =
    status === MODULE_TYPES.eligibility ? extendedEligibility : extendedToggle;

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
  });

  const { instanceAddress, hatterIsAdmin } = useMultiClaimsHatterCheck();

  const { hatToMintTo, hatToMintPended, pendMintHatForHatter } =
    usePendHatterMint({
      address: instanceAddress,
    });

  const { data: isEligible } = useWearerEligibilityCheck({
    wearer: address,
  });

  const { data: isActive } = useHatStatus();

  const { onCopy } = useClipboard(statusData?.id || '');
  const toast = useToast();

  let statusCheck = true;
  if (status === MODULE_TYPES.eligibility) {
    statusCheck = isEligible;
  } else if (status === MODULE_TYPES.toggle) {
    if (isAContract) {
      statusCheck = isActive;
    } else {
      statusCheck = selectedHat?.status || false;
    }
  }

  const isAdmin = isWearingAdminHat(_.map(wearerDetails, 'id'), hatToMintTo);

  let icon = FaCode;
  if (statusData?.id === FALLBACK_ADDRESS || statusData?.id === ZERO_ADDRESS) {
    icon = TbCircleOff;
  } else if (!statusData?.isContract) {
    icon = BsPersonBadge;
  }

  return (
    <Stack>
      <Flex justifyContent='space-between'>
        <Heading size='sm' fontWeight='medium' textTransform='uppercase'>
          {_.capitalize(_.toString(status))}
        </Heading>
        <Tooltip
          label={_.get(statusData, 'id')}
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
                  title: 'Successfully copied Address to clipboard',
                });
              }}
              aria-label='Copy Address'
              color='gray.500'
            />
            <ChakraNextLink
              href={`${explorerUrl(chainId)}/address/${_.get(
                statusData,
                'id',
              )}`}
              isExternal
            >
              <HStack>
                <Icon as={icon} ml={2} w={4} h={4} color='gray.500' />
                <Text color='gray.500' fontSize='sm'>
                  {moduleDetails
                    ? moduleDetails.name
                    : statusData?.ensName || formatAddress(statusData?.id)}
                </Text>
              </HStack>
            </ChakraNextLink>
          </HStack>
        </Tooltip>
      </Flex>
      <Flex justifyContent='space-between'>
        <HStack>
          <Text>{label}</Text>
        </HStack>

        <HStack color={statusCheck ? 'green.500' : 'red.500'} ml={2}>
          <Text>{statusCheck ? 'Yes' : 'No'}</Text>
          {statusCheck ? <FaCheck /> : <FaBan />}
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
                    color='blue.500'
                    borderColor='blue.500'
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
