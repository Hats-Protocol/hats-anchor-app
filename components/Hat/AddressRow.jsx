import {
  HStack,
  IconButton,
  Icon,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Text,
  Tooltip,
} from '@chakra-ui/react';
import { FaEllipsisV } from 'react-icons/fa';
import _ from 'lodash';
import { useAccount } from 'wagmi';
import { MODULE_TYPES, ZERO_ADDRESS } from '@/constants';
import AddressLink from '@/components/AddressLink';

const AddressRow = ({
  address,
  mutable,
  admin,
  chainId,
  type,
  setType,
  localOverlay,
  checkHatStatus,
  isTopHat,
  isLoading,
}) => {
  const { address: userAddress } = useAccount();
  const { setModals } = localOverlay;

  const openEditModal = () => {
    setType(type);
    setModals({ editModule: true });
  };

  const openWearerStatusModal = () => {
    setModals({ hatWearerStatus: true });
  };

  const openHatStatusModal = () => {
    setModals({ hatStatus: true });
  };

  const handleCheckHatStatus = async () => {
    await checkHatStatus?.();
  };

  return (
    <HStack spacing={3}>
      {address !== ZERO_ADDRESS ? (
        <AddressLink address={address} chainId={chainId} />
      ) : (
        <Text>{isTopHat ? 'None - Top Hat' : 'None Set'}</Text>
      )}

      {userAddress && ((mutable && admin) || userAddress === address) && (
        <Menu>
          <MenuButton
            as={IconButton}
            icon={<Icon as={FaEllipsisV} h='12px' w='12px' />}
            minW='auto'
            w={8}
            h={8}
            variant='ghost'
          />
          <MenuList>
            {mutable && admin && (
              <MenuItem onClick={openEditModal}>
                Edit {_.capitalize(type)} Module
              </MenuItem>
            )}
            {mutable &&
              _.eq(type, MODULE_TYPES.eligibility) &&
              _.eq(_.toLower(userAddress), _.toLower(address)) && (
                <MenuItem onClick={openWearerStatusModal}>
                  Change Wearer Status
                </MenuItem>
              )}
            {mutable && _.eq(type, MODULE_TYPES.toggle) && (
              <>
                <MenuItem
                  onClick={handleCheckHatStatus}
                  isDisabled={!checkHatStatus || isLoading}
                >
                  <Tooltip
                    label={!checkHatStatus ? 'Toggle is not a contract' : ''}
                    placement='left'
                    bg='gray.100'
                    color='black'
                    hasArrow
                  >
                    Check Hat Status
                  </Tooltip>
                </MenuItem>

                {_.eq(_.toLower(userAddress), _.toLower(address)) && (
                  <MenuItem onClick={openHatStatusModal}>
                    Change Hat Status
                  </MenuItem>
                )}
              </>
            )}
          </MenuList>
        </Menu>
      )}
    </HStack>
  );
};

export default AddressRow;
