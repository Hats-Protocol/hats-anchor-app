/* eslint-disable no-shadow */
import React from 'react';
import {
  Box,
  Text,
  Stack,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from '@chakra-ui/react';

import { idToPrettyId, prettyIdToIp } from '@/lib/hats';
import HatDetailsForm from '@/forms/HatDetailsForm';
import HatWearersAndAdminsForm from '@/forms/HatWearersAndAdminsForm';
import CustomAccordion from '@/components/CustomAccordion';

const EditMode = ({
  hatData,
  chainId,
  name,
  description,
  guilds,
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
        py='110px'
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
                      guilds,
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

export default EditMode;

interface EditModeProps {
  hatData: any;
  chainId: number;
  name: string;
  description: string;
  guilds: string[];
  imageUrl: string;
}
