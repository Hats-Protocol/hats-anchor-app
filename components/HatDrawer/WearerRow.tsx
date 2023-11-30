import {
  Badge,
  Flex,
  Icon,
  IconButton,
  Image,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
  useClipboard,
} from '@chakra-ui/react';
import _ from 'lodash';
import { BsFileCode } from 'react-icons/bs';
import { FaEllipsisH, FaUser } from 'react-icons/fa';
import { Hex } from 'viem';
import { useAccount, useChainId } from 'wagmi';

import ChakraNextLink from '@/components/atoms/ChakraNextLink';
import CONFIG from '@/constants';
import { useOverlay } from '@/contexts/OverlayContext';
import { useTreeForm } from '@/contexts/TreeFormContext';
import useHatBurn from '@/hooks/useHatBurn';
import useHatContractWrite from '@/hooks/useHatContractWrite';
import useModuleDetails from '@/hooks/useModuleDetails';
import useToast from '@/hooks/useToast';
import { formatAddress, isSameAddress } from '@/lib/general';
import { decimalId, isTopHat, toTreeId } from '@/lib/hats';
import { HatWearer } from '@/types';

import TooltipWrapper from './TooltipWrapper';

const WearerRow = ({
  wearer,
  isAdminUser,
  setChangeStatusWearer,
  setWearerToTransferFrom,
  isEligible,
}: WearerRowProps) => {
  const toast = useToast();
  const currentNetworkId = useChainId();
  const { setModals } = useOverlay();
  const { address } = useAccount();
  const { chainId, selectedHat } = useTreeForm();

  const hatId = selectedHat?.id;
  const isSameChain = chainId === currentNetworkId;
  const isEligibility = selectedHat?.eligibility === _.toLower(address);

  const { writeAsync: testEligibility, isLoading } = useHatContractWrite({
    functionName: 'checkHatWearerStatus',
    args: [decimalId(hatId), wearer.id],
    chainId,
    enabled:
      Boolean(hatId) &&
      Boolean(wearer) &&
      isEligible !== undefined &&
      !isEligible &&
      chainId === currentNetworkId,
    queryKeys: [
      ['hatDetails', { id: hatId, chainId }],
      ['treeDetails', toTreeId(hatId)],
    ],
    handleSuccess: (data) => {
      if (!_.isEmpty(data?.logs)) {
        toast.info({
          title: `The status of ${formatAddress(
            wearer.id,
          )} was successfully updated.`,
        });
      }
      // } else {
      //   this shouldn't happen with disable states
      //   toast.info({
      //     title: `No change in status for wearer, ${formatAddress(wearer.id)}.`,
      //   });
      // }
    },
  });
  const { details: moduleDetails } = useModuleDetails({
    address: wearer.id,
    enabled: wearer.isContract,
  });

  const updateEligibility = async () => {
    testEligibility?.();
  };

  const { writeAsync: renounceHat } = useHatBurn();

  const handleRenounceHat = async () => {
    await renounceHat?.();
  };

  const { onCopy } = useClipboard(wearer.id);

  let icon = <Icon as={FaUser} color='gray.500' />;
  if (isSameAddress(wearer.id, address)) {
    icon = <Image src='/icons/hat.svg' alt='Hat' />;
  } else if (wearer.isContract) {
    icon = <Icon as={BsFileCode} color='gray.500' />;
  }

  // could look up by Id to be more resilient?
  let moduleName = _.get(moduleDetails, 'name');
  if (moduleName === CONFIG.claimsHatterModuleName) {
    moduleName = 'Autonomous Admin';
  }

  return (
    <Flex key={wearer.id} justifyContent='space-between' alignItems='center'>
      <Flex
        alignItems='center'
        gap={2}
        backgroundColor={
          isSameAddress(wearer.id, address) ? 'green.100' : 'transparent'
        }
      >
        {icon}

        <Text>
          {_.get(wearer, 'ensName') ||
            moduleName ||
            formatAddress(_.get(wearer, 'id'))}
        </Text>
      </Flex>
      <Flex alignItems='center' gap={2}>
        {!isEligible && (
          <Badge colorScheme='gray' fontSize='sm' variant='outline'>
            INELIGIBLE
          </Badge>
        )}
        <ChakraNextLink href={`/wearers/${wearer.id}`}>
          <Text color='blue.500'>View</Text>
        </ChakraNextLink>
        <Menu isLazy>
          <MenuButton
            as={IconButton}
            aria-label='Options'
            icon={<FaEllipsisH />}
            size='xs'
            variant='outline'
          />
          <MenuList>
            <MenuItem
              isDisabled={!isSameChain || !isAdminUser}
              onClick={() => {
                setModals?.({ transferHat: true });
                setWearerToTransferFrom(wearer.id);
              }}
            >
              <TooltipWrapper
                isSameChain={isSameChain}
                label="You can't transfer a hat on a different chain"
              >
                <Text>Transfer</Text>
              </TooltipWrapper>
            </MenuItem>

            {isSameAddress(wearer.id, address) && !isTopHat(selectedHat) && (
              <MenuItem isDisabled={!isSameChain} onClick={handleRenounceHat}>
                <TooltipWrapper
                  isSameChain={isSameChain}
                  label="You can't renounce a hat on a different chain"
                >
                  <Text>Renounce</Text>
                </TooltipWrapper>
              </MenuItem>
            )}

            {!isSameAddress(wearer.id, address) && isEligibility && (
              <MenuItem
                isDisabled={!isSameChain}
                onClick={() => {
                  setModals?.({ hatWearerStatus: true });
                  setChangeStatusWearer(wearer.id);
                }}
              >
                <TooltipWrapper
                  isSameChain={isSameChain}
                  label="You can't revoke a hat on a different chain"
                >
                  <Text>Revoke Hat</Text>
                </TooltipWrapper>
              </MenuItem>
            )}

            <MenuItem
              isDisabled={!isSameChain || isLoading || !testEligibility}
              onClick={updateEligibility}
            >
              <TooltipWrapper
                isSameChain={isSameChain}
                label="You can't update eligibility of a hat on a different chain"
              >
                <Text>Update Eligibility</Text>
              </TooltipWrapper>
            </MenuItem>

            <MenuItem
              onClick={() => {
                onCopy();
                toast.info({
                  title: 'Successfully copied address to clipboard',
                });
              }}
            >
              <Text>Copy Address</Text>
            </MenuItem>
          </MenuList>
        </Menu>
      </Flex>
    </Flex>
  );
};

export default WearerRow;

interface WearerRowProps {
  wearer: HatWearer;
  isAdminUser: boolean;
  setChangeStatusWearer: (w: Hex) => void;
  setWearerToTransferFrom: (w: string) => void;
  isEligible: boolean;
}
