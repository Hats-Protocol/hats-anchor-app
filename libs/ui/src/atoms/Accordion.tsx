'use client';

import {
  Box,
  Collapse,
  Flex,
  Heading,
  HStack,
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
          <HStack>
            <Icon
              as={isOpen ? AiOutlineMinusSquare : AiOutlinePlusSquare}
              boxSize={5}
            />
            <Heading variant='lightMedium'>{title}</Heading>
          </HStack>
        </Flex>
        <Stack>
          {subtitle && (
            <Text size='md' ml={7} variant='light'>
              {subtitle}
            </Text>
          )}
        </Stack>
      </Flex>

      {!isOpen && dirtyFieldsList && dirtyFieldsList.length > 0 && (
        <Box fontSize='sm' ml={7} color='cyan.900' mt={2}>
          <Text size='medium'>Edits:</Text>
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
