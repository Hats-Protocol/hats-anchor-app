import {
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
import _ from 'lodash';
import { useMemo } from 'react';
import { BsPersonBadge } from 'react-icons/bs';
import { FaBan, FaCheck, FaCode } from 'react-icons/fa';
import { FiCopy } from 'react-icons/fi';
import { useAccount } from 'wagmi';

import ChakraNextLink from '@/components/atoms/ChakraNextLink';
import { MODULE_TYPES } from '@/constants/form';
import { useTreeForm } from '@/contexts/TreeFormContext';
import useHatStatus from '@/hooks/useHatStatus';
import useModuleDetails from '@/hooks/useModuleDetails';
import useToast from '@/hooks/useToast';
import useWearerEligibilityCheck from '@/hooks/useWearerEligibilityCheck';
import { formatAddress } from '@/lib/general';
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
  const { details: moduleDetails } = useModuleDetails({
    address: moduleAddress,
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

  return (
    <Stack>
      <Flex justifyContent='space-between'>
        <Heading size='sm' fontWeight='medium' textTransform='uppercase'>
          {_.capitalize(_.toString(status))}
        </Heading>
        <Tooltip
          label={_.get(statusData, 'id')}
          placement='left'
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
                {isAContract ? (
                  <Icon as={FaCode} ml={2} w={4} h={4} color='gray.500' />
                ) : (
                  <Icon as={BsPersonBadge} w={4} h={4} color='gray.500' />
                )}
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
    </Stack>
  );
};

export default StatusCard;
