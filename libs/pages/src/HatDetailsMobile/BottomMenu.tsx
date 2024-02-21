import {
  Box,
  Button,
  Flex,
  Image,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  useClipboard,
} from '@chakra-ui/react';
import { CONFIG } from '@hatsprotocol/constants';
import { useTreeForm } from 'contexts';
import { useToast } from 'hooks';
import { FaCopy, FaEllipsisV } from 'react-icons/fa';

const BottomMenu = () => {
  const { selectedHat } = useTreeForm();
  const { onCopy: copyHatId } = useClipboard(selectedHat?.id);
  const { onCopy: copyContractAddress } = useClipboard(CONFIG.hatsAddress);
  const toast = useToast();

  return (
    <Box w='100%' position='fixed' bottom={0} zIndex={14} bg='whiteAlpha.900'>
      <Flex
        justify='space-between'
        p={4}
        borderTop='1px solid'
        borderColor='gray.200'
      >
        <Button
          colorScheme='blue'
          leftIcon={<Image src='/icons/hat.svg' alt='Hat' color='white' />}
        >
          Claim this hat
        </Button>

        <Menu>
          <MenuButton as={Button} leftIcon={<FaEllipsisV />}>
            More
          </MenuButton>
          <MenuList>
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
          </MenuList>
        </Menu>
      </Flex>
    </Box>
  );
};

export default BottomMenu;
