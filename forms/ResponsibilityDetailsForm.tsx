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
import { FaEllipsisV, FaPlus, FaRegListAlt } from 'react-icons/fa';

export type Responsibility = {
  link: string;
  label: string;
};

const ResponsibilityDetailsForm = ({
  responsibilities,
  setResponsibilities,
  handleAddResponsibility,
  handleRemoveResponsibility,
}: {
  responsibilities: Responsibility[];
  setResponsibilities: (auths: Responsibility[]) => void;
  handleAddResponsibility: (responsibility: Responsibility) => void;
  handleRemoveResponsibility: (index: number) => void;
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [currentResponsibilityIndex, setCurrentResponsibilityIndex] =
    useState(0);

  const handleEdit = (index: number) => {
    setCurrentResponsibilityIndex(index);
    onOpen();
  };

  const handleSave = () => {
    onClose();
    setCurrentResponsibilityIndex(0);
  };

  return (
    <>
      <HStack alignItems='center' ml={-6}>
        <FaRegListAlt />
        <Text fontWeight={500}>Responsibilities</Text>
      </HStack>
      {responsibilities.map((responsibility, index) => (
        // eslint-disable-next-line react/no-array-index-key
        <Stack key={index}>
          <HStack alignItems='center' justifyContent='space-between'>
            <ChakraInput
              value={responsibility.label}
              onChange={(e) => {
                const newArr = [...responsibilities];
                newArr[index].label = e.target.value;
                setResponsibilities(newArr);
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
                <MenuItem onClick={() => handleRemoveResponsibility(index)}>
                  Delete
                </MenuItem>
              </MenuList>
            </Menu>

            <Modal isOpen={isOpen} onClose={onClose}>
              <ModalOverlay />
              <ModalContent>
                <ModalHeader>Edit Responsibility Link</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                  <ChakraInput
                    value={responsibilities[currentResponsibilityIndex]?.link}
                    onChange={(e) => {
                      const newArr = [...responsibilities];
                      newArr[currentResponsibilityIndex].link = e.target.value;
                      setResponsibilities(newArr);
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

          {responsibilities[index]?.link && (
            <Text fontSize='sm' color='gray.500'>
              {responsibilities[index]?.link}
            </Text>
          )}
        </Stack>
      ))}

      <Box mb={2}>
        <Button
          onClick={() => handleAddResponsibility({ link: '', label: '' })}
          isDisabled={
            responsibilities[responsibilities.length - 1]?.label === '' &&
            responsibilities[responsibilities.length - 1]?.link === ''
          }
          gap={2}
        >
          <FaPlus />
          Add Responsibility
        </Button>
      </Box>
    </>
  );
};

export default ResponsibilityDetailsForm;
