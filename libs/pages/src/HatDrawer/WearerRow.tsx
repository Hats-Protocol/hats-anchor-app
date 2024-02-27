import {
  Badge,
  Button,
  Flex,
  Icon,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
  useClipboard,
} from '@chakra-ui/react';
import { CONFIG } from '@hatsprotocol/constants';
import { useOverlay, useTreeForm } from 'contexts';
import {
  useHatBurn,
  useHatContractWrite,
  useModuleDetails,
  useWearerDetails,
  useWearerEligibilityCheck,
} from 'hats-hooks';
import { HatWearer } from 'hats-types';
import { decimalId, isTopHat, isWearingAdminHat } from 'hats-utils';
import { useMediaStyles, useToast } from 'hooks';
import _ from 'lodash';
import dynamic from 'next/dynamic';
import { BsFileCode } from 'react-icons/bs';
import { FaEllipsisH } from 'react-icons/fa';
import { idToIp, toTreeId } from 'shared';
import { formatAddress, isSameAddress } from 'utils';
import { Hex } from 'viem';
import { useAccount, useChainId } from 'wagmi';

const TooltipWrapper = dynamic(() =>
  import('ui').then((mod) => mod.TooltipWrapper),
);
const CopyHash = dynamic(() => import('ui').then((mod) => mod.CopyHash));
const ChakraNextLink = dynamic(() =>
  import('ui').then((mod) => mod.ChakraNextLink),
);
const WearerIcon = dynamic(() => import('ui').then((mod) => mod.WearerIcon));

const WearerRow = ({
  wearer,
  setChangeStatusWearer,
  setWearerToTransferFrom,
  isEligible,
}: WearerRowProps) => {
  const toast = useToast();
  const currentNetworkId = useChainId();
  const { setModals, handlePendingTx } = useOverlay();
  const { address } = useAccount();
  const { chainId, selectedHat } = useTreeForm();
  const { isMobile } = useMediaStyles();
  const { onCopy } = useClipboard(wearer.id);

  const { data: wearerDetails } = useWearerDetails({
    wearerAddress: wearer.id,
    chainId,
  });

  const hatId = selectedHat?.id;
  const isSameChain = chainId === currentNetworkId;
  const isEligibility = selectedHat?.eligibility === _.toLower(wearer.id);

  // include current wearer for Top Hat
  const isAdminUser = isWearingAdminHat(
    _.map(wearerDetails, 'id'),
    selectedHat?.id,
    !!isTopHat(selectedHat),
  );

  const txDescription = `Checked status for ${formatAddress(
    wearer.id,
  )} on hat ${idToIp(hatId)}}`;

  const { writeAsync: updateEligibility, isLoading } = useHatContractWrite({
    functionName: 'checkHatWearerStatus',
    args: [decimalId(hatId), wearer.id],
    chainId,
    enabled:
      Boolean(hatId) &&
      Boolean(wearer) &&
      isEligible !== undefined &&
      isEligible &&
      chainId === currentNetworkId,
    queryKeys: [
      ['hatDetails', { id: hatId, chainId }],
      ['treeDetails', toTreeId(hatId)],
    ],
    handlePendingTx,
    txDescription,
    onSuccessToastData: {
      title: txDescription,
    },
  });

  const { data: isEligibleRead } = useWearerEligibilityCheck({
    wearer: wearer.id,
    selectedHat,
    chainId,
  });

  const { details: moduleDetails } = useModuleDetails({
    address: wearer.id,
    chainId,
    enabled: wearer.isContract,
  });

  const { writeAsync: renounceHat } = useHatBurn({
    selectedHat,
    chainId,
    onSuccess: () => {},
  });

  const handleRenounceHat = async () => {
    renounceHat?.().catch((e) => {
      // eslint-disable-next-line no-console
      console.error(e);
    });
  };

  const copyAddress = () => {
    onCopy();
    toast.info({
      title: 'Successfully copied address to clipboard',
    });
  };

  let icon = WearerIcon;
  if (wearer.isContract) {
    icon = BsFileCode;
  }

  // could look up by Id to be more resilient?
  let moduleName = _.get(moduleDetails, 'name');
  if (moduleName === CONFIG.claimsHatterModuleName) {
    moduleName = 'Autonomous Admin';
  }

  return (
    <Flex key={wearer.id} justifyContent='space-between' alignItems='center'>
      <ChakraNextLink href={`/wearers/${wearer.id}`}>
        <Flex
          alignItems='center'
          gap={2}
          backgroundColor={
            isSameAddress(wearer.id, address) ? 'green.100' : 'transparent'
          }
        >
          <Icon
            as={icon}
            color={isSameAddress(wearer.id, address) ? 'green.700' : 'gray.500'}
            boxSize={{ base: '14px', md: 4 }}
          />

          <Text
            color={isSameAddress(wearer.id, address) ? 'green.700' : 'inherit'}
            size={{ base: 'sm', md: 'md' }}
          >
            {_.get(wearer, 'ensName') ||
              moduleName ||
              formatAddress(_.get(wearer, 'id'))}
          </Text>
        </Flex>
      </ChakraNextLink>
      <Flex alignItems='center' gap={2}>
        {(!isEligible || !isEligibleRead) && (
          <Badge colorScheme='gray' fontSize='xs' variant='outline'>
            INELIGIBLE
          </Badge>
        )}

        {!isSameAddress(wearer.id, address) ? (
          <IconButton
            icon={<Icon as={CopyHash} boxSize={4} color='blackAlpha.500' />}
            p={0}
            size='xs'
            variant='ghost'
            aria-label='Copy wearer address'
            onClick={copyAddress}
          />
        ) : (
          isMobile && (
            <Button
              variant='ghost'
              size='xs'
              fontWeight='normal'
              bg='transparent'
              isDisabled={!isSameChain}
              onClick={handleRenounceHat}
              color='blackAlpha.500'
            >
              Renounce
            </Button>
          )
        )}

        {!isMobile && (
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
                isDisabled={!isSameChain || isLoading || !updateEligibility}
                onClick={() => updateEligibility?.()}
              >
                <TooltipWrapper
                  isSameChain={isSameChain}
                  label="You can't update eligibility of a hat on a different chain"
                >
                  <Text>Update Eligibility</Text>
                </TooltipWrapper>
              </MenuItem>

              <MenuItem onClick={copyAddress}>
                <Text>Copy Address</Text>
              </MenuItem>
            </MenuList>
          </Menu>
        )}
      </Flex>
    </Flex>
  );
};

export default WearerRow;

interface WearerRowProps {
  wearer: HatWearer;
  setChangeStatusWearer: (w: Hex) => void;
  setWearerToTransferFrom: (w: string) => void;
  isEligible: boolean;
}
