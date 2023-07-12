import {
  Accordion,
  AccordionButton,
  AccordionItem,
  AccordionPanel,
  Flex,
  Heading,
} from '@chakra-ui/react';
import React, { useState } from 'react';
import { FaRegMinusSquare, FaRegPlusSquare } from 'react-icons/fa';

const CustomAccordion = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => {
  const [isOpen, setIsOpen] = useState(true);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  return (
    <Accordion defaultIndex={[0]} allowMultiple border='transparent'>
      <AccordionItem>
        <AccordionButton onClick={handleToggle} px={0}>
          <Flex flex='1' alignItems='center'>
            {isOpen ? <FaRegMinusSquare /> : <FaRegPlusSquare />}
            <Heading size='sm' fontWeight='medium' ml={3}>
              {title}
            </Heading>
          </Flex>
        </AccordionButton>
        <AccordionPanel pl={7} mr={0} pr={0}>
          {children}
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  );
};

export default CustomAccordion;
