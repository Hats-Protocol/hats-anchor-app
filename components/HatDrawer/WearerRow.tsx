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
  Tooltip,
} from '@chakra-ui/react';
import _ from 'lodash';
import { FaEllipsisH, FaUser } from 'react-icons/fa';

import ChakraNextLink from '@/components/atoms/ChakraNextLink';
import useHatContractWrite from '@/hooks/useHatContractWrite';
import useToast from '@/hooks/useToast';
import { formatAddress, isSameAddress } from '@/lib/general';
import { decimalId } from '@/lib/hats';

// TooltipWrapper component
const TooltipWrapper = ({
  children,
  label,
  isSameChain,
}: {
  children: React.ReactNode;
  label: string;
  isSameChain: boolean;
}) => (
  <Tooltip label={!isSameChain ? label : ''} shouldWrapChildren>
    {children}
  </Tooltip>
);

const WearerRow = ({
  wearer,
  isAdminUser,
  address,
  ensNames,
  handleRenounceHat,
  setModals,
  setChangeStatusWearer,
  setWearerToTransferFrom,
  isSameChain,
  hatId,
  chainId,
  currentNetworkId,
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

        <Text>{ensNames[wearer.id] || formatAddress(_.get(wearer, 'id'))}</Text>
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
              onClick={async () => {
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
              }}
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
  wearer: { id: string };
  isAdminUser: boolean;
  address?: string;
  ensNames: {
    [key: string]: string;
  };
  handleRenounceHat: () => void;
  setModals: any;
  setChangeStatusWearer: any;
  setWearerToTransferFrom: (w: string) => void;
  isSameChain: boolean;
  hatId: string;
  chainId: number;
  currentNetworkId: number;
}
