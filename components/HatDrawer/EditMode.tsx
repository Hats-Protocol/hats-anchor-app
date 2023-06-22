/* eslint-disable no-shadow */
import React from 'react';
import {
  Box,
  Text,
  Stack,
  Heading,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from '@chakra-ui/react';

import { idToPrettyId, prettyIdToIp } from '@/lib/hats';
import HatDetailsForm from '@/forms/HatDetailsForm';

const EditMode = ({ hatData, chainId, name, description }: EditModeProps) => {
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
        <Stack spacing={4}>
          <Heading size='sm' fontWeight='medium'>
            Hat Details
          </Heading>
          <Text>Describe the role that this Hat symbolizes.</Text>
          <Tabs>
            <TabList>
              <Tab>Hats V2 Schema</Tab>
            </TabList>

            <TabPanels>
              <TabPanel>
                <HatDetailsForm hatData={hatData} chainId={chainId} />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Stack>
      </Stack>
    </Box>
  );
};

export default EditMode;

interface EditModeProps {
  hatData: any;
  chainId: number;
  name: string;
  description: string;
}
