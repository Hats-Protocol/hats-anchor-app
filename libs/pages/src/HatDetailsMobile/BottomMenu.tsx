import {
  Box,
  Button,
  Flex,
  Image,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
} from '@chakra-ui/react';
import { FaEllipsisV } from 'react-icons/fa';

const BottomMenu = () => {
  return (
    <Box
      w='100%'
      position='absolute'
      bottom={0}
      zIndex={14}
      bg='whiteAlpha.900'
    >
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
            <MenuItem>Item 1</MenuItem>
            <MenuItem>Item 2</MenuItem>
          </MenuList>
        </Menu>
      </Flex>
    </Box>
  );
};

export default BottomMenu;
