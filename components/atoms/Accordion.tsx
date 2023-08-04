import {
  Accordion,
  AccordionButton,
  AccordionItem,
  AccordionPanel,
  Flex,
  Heading,
  Text,
} from '@chakra-ui/react';
import React, { useState } from 'react';
import { FaRegMinusSquare, FaRegPlusSquare } from 'react-icons/fa';

const CustomAccordion = ({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  return (
    <Accordion defaultIndex={[]} allowMultiple border='transparent'>
      <AccordionItem>
        <AccordionButton onClick={handleToggle} px={0}>
          <Flex flex='1' alignItems='center'>
            {isOpen ? <FaRegMinusSquare /> : <FaRegPlusSquare />}
            <Heading size='md' fontWeight='medium' ml={3}>
              {title}
            </Heading>
          </Flex>
        </AccordionButton>
        {subtitle && (
          <Text fontSize='sm' ml={7} color='gray.500'>
            {subtitle}
          </Text>
        )}
        <AccordionPanel pl={7} mr={0} pr={0} mt={8}>
          {children}
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  );
};

export default CustomAccordion;
