/* eslint-disable no-shadow */
import React, { useState } from 'react';
import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  Box,
  Text,
  Stack,
  Heading,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Flex,
} from '@chakra-ui/react';
import { FaRegMinusSquare, FaRegPlusSquare } from 'react-icons/fa';

import { idToPrettyId, prettyIdToIp } from '@/lib/hats';
import HatDetailsForm from '@/forms/HatDetailsForm';
import HatWearersAndAdminsForm from '@/forms/HatWearersAndAdminsForm';

const EditMode = ({
  hatData,
  chainId,
  name,
  description,
  imageUrl,
}: EditModeProps) => {
  if (!hatData) return null;

  return (
    <Box w='100%' overflow='scroll' height='100%'>
      {/* Main Details */}
      <Stack
        position='relative'
        p={10}
        spacing={10}
        pt='110px'
        overflow='auto'
        height='100%'
      >
        <Stack>
          <Text>{prettyIdToIp(idToPrettyId(hatData?.id))}</Text>
          <Text>{name}</Text>
          <Text>{description}</Text>
          <Text>All changes are local until you deploy to chain.</Text>
        </Stack>

        <CustomAccordion title='Hat Details'>
          <Stack spacing={4}>
            <Text>Describe the role that this Hat symbolizes.</Text>
            <Tabs>
              <TabList>
                <Tab>Hats V2 Schema</Tab>
              </TabList>

              <TabPanels>
                <TabPanel px={0}>
                  <HatDetailsForm
                    hatData={hatData}
                    chainId={chainId}
                    defaultValues={{
                      name,
                      description,
                      imageUrl,
                    }}
                  />
                </TabPanel>
              </TabPanels>
            </Tabs>
          </Stack>
        </CustomAccordion>

        <CustomAccordion title='Wearers & Administrators'>
          <Stack spacing={4}>
            <Text>
              The people and contracts that control and wear this Hat.
            </Text>
            <HatWearersAndAdminsForm defaultAdmin={hatData?.admin?.prettyId} />
          </Stack>
        </CustomAccordion>
      </Stack>
    </Box>
  );
};

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
    <Accordion defaultIndex={[0]} allowMultiple>
      <AccordionItem>
        <AccordionButton onClick={handleToggle} px={0}>
          <Flex flex='1' alignItems='center'>
            {isOpen ? <FaRegMinusSquare /> : <FaRegPlusSquare />}
            <Heading size='sm' fontWeight='medium' ml={3}>
              {title}
            </Heading>
          </Flex>
        </AccordionButton>
        <AccordionPanel pl={7} mr={0}>
          {children}
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  );
};

export default EditMode;

interface EditModeProps {
  hatData: any;
  chainId: number;
  name: string;
  description: string;
  imageUrl: string;
}
