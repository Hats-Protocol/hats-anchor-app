import {
  Flex,
  Heading,
  HStack,
  Icon,
  Stack,
  Text,
  Tooltip,
} from '@chakra-ui/react';
import _ from 'lodash';
import { BsPersonBadge } from 'react-icons/bs';
import { FaBan, FaCheck, FaCode } from 'react-icons/fa';
import { useAccount } from 'wagmi';

import ChakraNextLink from '@/components/atoms/ChakraNextLink';
import { useTreeForm } from '@/contexts/TreeFormContext';
import useHatStatus from '@/hooks/useHatStatus';
import useModuleDetails from '@/hooks/useModuleDetails';
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
  const { eligibility, toggle } = _.pick(selectedHat, [
    'eligibility',
    'toggle',
  ]);
  const statusData = status === 'eligibility' ? eligibility : toggle;

  const { data: moduleDetails } = useModuleDetails(statusData, chainId);
  const { data: isEligible } = useWearerEligibilityCheck({
    wearer: address,
  });

  const { data: isActive } = useHatStatus();

  let statusCheck = true;
  if (status === 'eligibility') {
    statusCheck = isEligible as boolean;
  } else if (status === 'toggle') {
    if (isAContract) {
      statusCheck = isActive as boolean;
    } else {
      statusCheck = selectedHat?.status as boolean;
    }
  }

  return (
    <Stack>
      <Flex justifyContent='space-between'>
        <Heading size='sm' fontWeight='medium' textTransform='uppercase'>
          {_.capitalize(status)}
        </Heading>
        <Tooltip
          label={statusData}
          placement='left'
          shouldWrapChildren
          hasArrow
        >
          <ChakraNextLink
            href={`${explorerUrl(chainId)}/address/${statusData}`}
            isExternal
          >
            <HStack>
              {isAContract ? (
                <Icon as={FaCode} ml={2} w={4} h={4} color='gray.500' />
              ) : (
                <Icon as={BsPersonBadge} w={4} h={4} color='gray.500' />
              )}
              <Text color='gray.500' fontSize='sm'>
                {moduleDetails ? moduleDetails.name : formatAddress(statusData)}
              </Text>
            </HStack>
          </ChakraNextLink>
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
