/* eslint-disable no-nested-ternary */
import {
  Flex,
  IconButton,
  Image,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
} from '@chakra-ui/react';
import _ from 'lodash';
import { FaEllipsisH, FaUser } from 'react-icons/fa';

import ChakraNextLink from '@/components/atoms/ChakraNextLink';
import CONFIG from '@/constants';
import useHatBurn from '@/hooks/useHatBurn';
import useHatContractWrite from '@/hooks/useHatContractWrite';
import useToast from '@/hooks/useToast';
import { formatAddress, isSameAddress } from '@/lib/general';
import { decimalId } from '@/lib/hats';
import { IHatWearer } from '@/types';

import TooltipWrapper from './TooltipWrapper';

const WearerRow = ({
  wearer,
  isAdminUser,
  address,
  setModals,
  setChangeStatusWearer,
  setWearerToTransferFrom,
  isSameChain,
  hatId,
  chainId,
  currentNetworkId,
  wearers,
}: WearerRowProps) => {
  const { writeAsync, isLoading } = useHatContractWrite({
    functionName: 'checkHatWearerStatus',
    args: [decimalId(hatId), wearer.id],
    chainId,
    onSuccessToastData: {
      title: 'Success',
      description: `${wearer.id} is eligible to receive the hat.`,
    },
    enabled: Boolean(hatId) && Boolean(wearer) && chainId === currentNetworkId,
  });
  const toast = useToast();

  const testEligibility = async () => {
    const updated = await writeAsync?.();
    if (updated) {
      toast.info({
        title: `The status of ${wearer.id} was successfully updated.`,
      });
    } else {
      toast.info({
        title: `The status of ${wearer.id} was not updated.`,
      });
    }
  };

  const { writeAsync: renounceHat } = useHatBurn({
    hatsAddress: CONFIG.hatsAddress,
    chainId,
    hatId,
    wearers,
  });

  const handleRenounceHat = async () => {
    await renounceHat?.();
  };

  return (
    <Flex key={wearer.id} justifyContent='space-between' alignItems='center'>
      <Flex
        alignItems='center'
        gap={2}
        backgroundColor={
          isSameAddress(wearer.id, address) ? 'green.100' : 'transparent'
        }
      >
        {isSameAddress(wearer.id, address) ? (
          <Image src='/icons/hat.svg' alt='Hat' />
        ) : (
          <FaUser />
        )}

        <Text>
          {_.get(wearer, 'ensName') || formatAddress(_.get(wearer, 'id'))}
        </Text>
      </Flex>
      <Flex alignItems='center' gap={2}>
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
            {isAdminUser && (
              <MenuItem
                isDisabled={!isSameChain}
                onClick={() => {
                  setModals({ transferHat: true });
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
            )}

            {isSameAddress(wearer.id, address) && (
              <MenuItem isDisabled={!isSameChain} onClick={handleRenounceHat}>
                <TooltipWrapper
                  isSameChain={isSameChain}
                  label="You can't renounce a hat on a different chain"
                >
                  <Text>Renounce</Text>
                </TooltipWrapper>
              </MenuItem>
            )}

            {!isSameAddress(wearer.id, address) && isAdminUser && (
              <MenuItem
                isDisabled={!isSameChain}
                onClick={() => {
                  setModals({ hatWearerStatus: true });
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
              isDisabled={!isSameChain || isLoading || !writeAsync}
              onClick={testEligibility}
            >
              <TooltipWrapper
                isSameChain={isSameChain}
                label="You can't test eligibility of a hat on a different chain"
              >
                <Text>Test Eligibility</Text>
              </TooltipWrapper>
            </MenuItem>
          </MenuList>
        </Menu>
      </Flex>
    </Flex>
  );
};

export default WearerRow;

interface WearerRowProps {
  wearer: IHatWearer;
  isAdminUser: boolean;
  address?: string;
  setModals: any;
  setChangeStatusWearer: any;
  setWearerToTransferFrom: (w: string) => void;
  isSameChain: boolean;
  hatId: string;
  chainId: number;
  currentNetworkId: number;
  wearers: IHatWearer[] | undefined;
}
