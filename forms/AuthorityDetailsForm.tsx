import {
  Box,
  Button,
  HStack,
  IconButton,
  Input,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  useDisclosure,
} from '@chakra-ui/react';
import { useState } from 'react';
import { FaEllipsisV, FaKey, FaPlus } from 'react-icons/fa';

export type Authority = {
  link: string;
  label: string;
};

const AuthorityDetailsForm = ({
  authorities,
  setAuthorities,
  handleAddAuthority,
  handleRemoveAuthority,
}: {
  authorities: Authority[];
  setAuthorities: (auths: Authority[]) => void;
  handleAddAuthority: (authority: Authority) => void;
  handleRemoveAuthority: (index: number) => void;
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [currentAuthorityIndex, setCurrentAuthorityIndex] = useState(0);

  const handleEdit = (index: number) => {
    setCurrentAuthorityIndex(index);
    onOpen();
  };

  const handleSave = () => {
    onClose();
    setCurrentAuthorityIndex(0);
  };

  return (
    <>
      <HStack alignItems='center' ml={-6}>
        <FaKey />
        <Text fontWeight={500}>Authorities</Text>
      </HStack>
      {authorities.map((authority, index) => (
        <>
          <HStack
            key={authority.label}
            alignItems='center'
            justifyContent='space-between'
          >
            <Input
              value={authority.label}
              onChange={(e) => {
                const newArr = [...authorities];
                newArr[index].label = e.target.value;
                setAuthorities(newArr);
              }}
              placeholder='Label'
            />

            <Menu>
              <MenuButton
                as={IconButton}
                aria-label='Options'
                icon={<FaEllipsisV />}
                variant='outline'
              />
              <MenuList>
                <MenuItem onClick={() => handleEdit(index)}>Edit Link</MenuItem>
                <MenuItem onClick={() => handleRemoveAuthority(index)}>
                  Delete
                </MenuItem>
              </MenuList>
            </Menu>

            <Modal isOpen={isOpen} onClose={onClose}>
              <ModalOverlay />
              <ModalContent>
                <ModalHeader>Edit Authority Link</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                  <Input
                    value={authorities[currentAuthorityIndex]?.link}
                    onChange={(e) => {
                      const newArr = [...authorities];
                      newArr[currentAuthorityIndex].link = e.target.value;
                      setAuthorities(newArr);
                    }}
                    placeholder='Link'
                  />
                </ModalBody>
                <ModalFooter>
                  <Button colorScheme='blue' mr={3} onClick={handleSave}>
                    Ok
                  </Button>
                  <Button variant='ghost' onClick={onClose}>
                    Cancel
                  </Button>
                </ModalFooter>
              </ModalContent>
            </Modal>
          </HStack>

          {authorities[currentAuthorityIndex]?.link && (
            <Text fontSize='sm' color='gray.500'>
              {authorities[currentAuthorityIndex]?.link}
            </Text>
          )}
        </>
      ))}
      <Box mb={2}>
        <Button
          onClick={() => handleAddAuthority({ link: '', label: '' })}
          isDisabled={
            authorities[authorities.length - 1]?.label === '' &&
            authorities[authorities.length - 1]?.link === ''
          }
          gap={2}
        >
          <FaPlus />
          Add Authority
        </Button>
      </Box>
    </>
  );
};

export default AuthorityDetailsForm;
