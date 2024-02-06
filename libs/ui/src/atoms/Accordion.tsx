import {
  Box,
  Collapse,
  Flex,
  Heading,
  Icon,
  Stack,
  Text,
} from '@chakra-ui/react';
import React, { useState } from 'react';
import { AiOutlineMinusSquare, AiOutlinePlusSquare } from 'react-icons/ai';

const Accordion = ({
  title,
  subtitle,
  dirtyFieldsList,
  open = false,
  children,
}: {
  title: string;
  subtitle?: string;
  dirtyFieldsList?: string[];
  open?: boolean;
  children: React.ReactNode;
}) => {
  const [isOpen, setIsOpen] = useState(open);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  return (
    <Flex direction='column' w='100%'>
      <Flex
        direction='column'
        onClick={handleToggle}
        _hover={{ cursor: 'pointer' }}
      >
        <Flex alignItems='center'>
          <Icon
            as={isOpen ? AiOutlineMinusSquare : AiOutlinePlusSquare}
            boxSize={5}
          />
          <Heading fontWeight='medium' ml={2} color='blackAlpha.800'>
            {title}
          </Heading>
        </Flex>
        <Stack>
          {subtitle && (
            <Text fontSize='md' ml={7} color='blackAlpha.800'>
              {subtitle}
            </Text>
          )}
        </Stack>
      </Flex>

      {!isOpen && dirtyFieldsList && dirtyFieldsList.length > 0 && (
        <Box fontSize='sm' ml={7} color='cyan.900' mt={2}>
          <Text fontWeight='medium'>Edits:</Text>
          {dirtyFieldsList?.map((field) => (
            <Text key={field}>- {field} changed</Text>
          ))}
        </Box>
      )}

      <Collapse in={isOpen} animateOpacity>
        <Flex pl={7} mr={0} pr={0} mt={8} pb={0}>
          {children}
        </Flex>
      </Collapse>
    </Flex>
  );
};

export default Accordion;
