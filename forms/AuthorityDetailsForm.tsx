import {
  Box,
  Button,
  HStack,
  IconButton,
  Input as ChakraInput,
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
  Stack,
  Text,
  useDisclosure,
} from '@chakra-ui/react';
import { useState } from 'react';
import { FaEllipsisV, FaKey, FaPlus } from 'react-icons/fa';

import { validateURL } from '@/lib/general';

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
  const [isLinkValid, setIsLinkValid] = useState(false);
  const [inputLink, setInputLink] = useState('');

  const handleEdit = (index: number) => {
    setInputLink(authorities[index].link);
    setCurrentAuthorityIndex(index);
    onOpen();
  };

  const handleSave = () => {
    if (isLinkValid) {
      const newArr = [...authorities];
      newArr[currentAuthorityIndex].link = inputLink;
      setAuthorities(newArr);
      setInputLink('');
      setCurrentAuthorityIndex(0);
    }
    onClose();
  };

  return (
    <>
      <HStack alignItems='center' ml={-6}>
        <FaKey />
        <Text fontWeight={500}>Authorities</Text>
      </HStack>
      {authorities.map((authority, index) => (
        // eslint-disable-next-line react/no-array-index-key
        <Stack key={index}>
          <HStack alignItems='center' justifyContent='space-between'>
            <ChakraInput
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
                  <ChakraInput
                    value={authorities[currentAuthorityIndex]?.link}
                    onChange={(e) => {
                      setInputLink(e.target.value);
                      setIsLinkValid(validateURL(e.target.value));
                    }}
                    placeholder='Link'
                  />
                </ModalBody>
                <ModalFooter>
                  <Button
                    colorScheme='blue'
                    mr={3}
                    onClick={handleSave}
                    isDisabled={!isLinkValid}
                  >
                    Ok
                  </Button>
                  <Button variant='ghost' onClick={onClose}>
                    Cancel
                  </Button>
                </ModalFooter>
              </ModalContent>
            </Modal>
          </HStack>

          {authorities[index]?.link && (
            <Text fontSize='sm' color='gray.500'>
              {authorities[index]?.link}
            </Text>
          )}
        </Stack>
      ))}

      <Box mb={2}>
        <Button
          onClick={() => {
            if (authorities.length < 2) {
              handleAddAuthority({ link: '', label: '' });
            }
          }}
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
