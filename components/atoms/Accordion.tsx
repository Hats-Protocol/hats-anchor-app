import {
  Accordion,
  AccordionButton,
  AccordionItem,
  AccordionPanel,
  Box,
  Flex,
  Heading,
  Icon,
  Text,
} from '@chakra-ui/react';
import React, { useState } from 'react';
import { AiOutlineMinusSquare, AiOutlinePlusSquare } from 'react-icons/ai';

const CustomAccordion = ({
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
    <Accordion
      defaultIndex={open ? [0] : undefined}
      allowMultiple
      border='transparent'
    >
      <AccordionItem>
        <AccordionButton onClick={handleToggle} px={0}>
          <Flex flex='1' alignItems='center'>
            <Icon
              as={isOpen ? AiOutlineMinusSquare : AiOutlinePlusSquare}
              boxSize={5}
            />
            <Heading
              size='md'
              fontWeight='medium'
              ml={2}
              color='blackAlpha.800'
            >
              {title}
            </Heading>
          </Flex>
        </AccordionButton>
        {subtitle && (
          <Text fontSize='md' ml={7} color='blackAlpha.800'>
            {subtitle}
          </Text>
        )}
        {!isOpen && dirtyFieldsList && dirtyFieldsList.length > 0 && (
          <Box fontSize='sm' ml={7} color='cyan.900' mt={2}>
            <Text fontWeight='medium'>Edits:</Text>
            {dirtyFieldsList?.map((field) => (
              <Text key={field}>- {field} changed</Text>
            ))}
          </Box>
        )}
        <AccordionPanel pl={7} mr={0} pr={0} mt={8} pb={0}>
          {children}
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  );
};

export default CustomAccordion;
