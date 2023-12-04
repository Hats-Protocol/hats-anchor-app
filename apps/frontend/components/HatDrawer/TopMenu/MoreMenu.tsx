import {
  Button,
  HStack,
  Icon,
  Link,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
  Tooltip,
  useClipboard,
} from '@chakra-ui/react';
import _ from 'lodash';
import {
  FaCopy,
  FaDoorOpen,
  FaEllipsisV,
  FaExclamationCircle,
  FaLink,
  FaLock,
  FaPowerOff,
} from 'react-icons/fa';
import { TbChartDots3 } from 'react-icons/tb';
import { useAccount, useChainId } from 'wagmi';

import CONFIG, { MUTABILITY } from '@/utils/constants';
import { useOverlay } from '@/contexts/OverlayContext';
import { useTreeForm } from '@/contexts/TreeFormContext';
import useHatContractWrite from '@/hooks/useHatContractWrite';
import useHatMakeImmutable from '@/hooks/useHatMakeImmutable';
import useHatStatusCheck from '@/hooks/useHatStatusCheck';
import useToast from '@/hooks/useToast';
import useWearerDetails from '@/hooks/useWearerDetails';
import { isSameAddress } from '@/lib/general';
import {
  decimalId,
  handleExportBranch,
  idToPrettyId,
  isWearingAdminHat,
  prettyIdToIp,
  toTreeId,
} from '@/lib/hats';

const MoreMenu = () => {
  const localOverlay = useOverlay();
  const { setModals } = localOverlay;
  const { chainId, selectedHat, treeToDisplay, storedData, linkedHatIds } =
    useTreeForm();
  const { address } = useAccount();
  const currentNetworkId = useChainId();
  const toast = useToast();

  const { data: wearer } = useWearerDetails({
    wearerAddress: address,
    chainId,
  });

  const isAdminUser = isWearingAdminHat(_.map(wearer, 'id'), selectedHat?.id);

  const mutableStatus = selectedHat?.mutable ? MUTABILITY.MUTABLE : 'Immutable';

  const {
    writeAsync: updateImmutability,
    isLoading: isLoadingUpdateImmutability,
  } = useHatMakeImmutable({
    levelAtLocalTree: selectedHat?.levelAtLocalTree,
    isAdminUser,
    mutable: selectedHat?.mutable,
  });

  const { writeAsync: toggleHat, isLoading: isLoadingToggleHat } =
    useHatContractWrite({
      functionName: 'setHatStatus',
      args: [selectedHat?.id, !selectedHat?.status],
      chainId,
      onSuccessToastData: {
        title: 'Hat Status Updated!',
        description: 'Successfully updated hat',
      },
      queryKeys: [
        ['hatDetails', { id: selectedHat?.id, chainId }],
        ['treeDetails', toTreeId(selectedHat?.id)],
      ],
      enabled:
        Boolean(selectedHat) &&
        isSameAddress(address, selectedHat?.toggle) &&
        chainId === currentNetworkId,
    });

  const {
    writeAsync: checkHatStatus,
    isLoading: isLoadingCheckHatStatus,
    toggleIsContract,
  } = useHatStatusCheck({
    chainId,
    hatData: selectedHat,
  });

  const { onCopy: copyHatId } = useClipboard(decimalId(selectedHat?.id));
  const { onCopy: copyContractAddress } = useClipboard(CONFIG.hatsAddress);

  const handleExport = () =>
    handleExportBranch({
      targetHatId: selectedHat?.id,
      treeToDisplay,
      linkedHatIds,
      storedData,
      chainId,
      toast,
    });

  if (!selectedHat) return null;

  return (
    <Menu isLazy>
      <MenuButton as={Button} variant='outline'>
        <HStack>
          <Icon as={FaEllipsisV} />
          <Text>More</Text>
        </HStack>
      </MenuButton>
      <MenuList gap={5}>
        {isAdminUser && (
          <MenuItem
            gap={2}
            onClick={() => updateImmutability?.()}
            isDisabled={
              mutableStatus === MUTABILITY.IMMUTABLE ||
              !updateImmutability ||
              isLoadingUpdateImmutability
            }
          >
            <Tooltip
              label={
                !updateImmutability
                  ? "You don't have permission to make this hat immutable"
                  : ''
              }
              shouldWrapChildren
            >
              <HStack>
                <FaLock />
                <Text>Make immutable</Text>
              </HStack>
            </Tooltip>
          </MenuItem>
        )}
        {(isAdminUser || isSameAddress(selectedHat?.toggle, address)) && (
          <MenuItem
            gap={2}
            onClick={() => toggleHat?.()}
            isDisabled={
              !isSameAddress(selectedHat?.toggle, address) ||
              isLoadingToggleHat ||
              !toggleHat
            }
          >
            <Tooltip
              label={
                !isSameAddress(selectedHat?.toggle, address)
                  ? "Your address doesn't match the hat's toggle address"
                  : ''
              }
              shouldWrapChildren
            >
              <HStack>
                <FaPowerOff />
                <Text>
                  {selectedHat?.status ? 'Deactivate' : 'Activate'} hat
                </Text>
              </HStack>
            </Tooltip>
          </MenuItem>
        )}
        <MenuItem onClick={handleExport}>
          <HStack>
            <TbChartDots3 />
            <Text>
              Export branch {prettyIdToIp(idToPrettyId(selectedHat?.id))}
            </Text>
          </HStack>
        </MenuItem>
        {address && (
          <MenuItem
            gap={2}
            onClick={() => setModals?.({ requestLink: true })}
            isDisabled={chainId !== currentNetworkId}
          >
            <Tooltip
              label={
                chainId !== currentNetworkId
                  ? "You can't request to link a hat on a different chain"
                  : ''
              }
              shouldWrapChildren
            >
              <HStack>
                <FaLink />

                <Text>Request to link tree here</Text>
              </HStack>
            </Tooltip>
          </MenuItem>
        )}
        <Tooltip
          label={!toggleIsContract ? 'The toggle is "humanistic"' : ''}
          shouldWrapChildren
        >
          <MenuItem
            gap={2}
            onClick={() => checkHatStatus?.()}
            isDisabled={
              isLoadingCheckHatStatus || !checkHatStatus || !toggleIsContract
            }
          >
            <Tooltip
              label={
                chainId !== currentNetworkId
                  ? "You can't test status of a hat on a different chain"
                  : ''
              }
              shouldWrapChildren
            >
              <HStack>
                <FaDoorOpen />
                <Text>Test hat status</Text>
              </HStack>
            </Tooltip>
          </MenuItem>
        </Tooltip>
        <MenuItem
          gap={2}
          onClick={() => {
            copyHatId();
            toast.info({
              title: 'Successfully copied hat ID to clipboard',
            });
          }}
        >
          <FaCopy />
          Copy hat ID
        </MenuItem>
        <MenuItem
          gap={2}
          onClick={() => {
            copyContractAddress();
            toast.info({
              title: 'Successfully copied contract address to clipboard',
            });
          }}
        >
          <FaCopy />
          Copy contract ID
        </MenuItem>
        <MenuItem as={Link} href='mailto:support@hatsprotocol.xyz' gap={2}>
          <FaExclamationCircle />
          Report this hat
        </MenuItem>
      </MenuList>
    </Menu>
  );
};

export default MoreMenu;
