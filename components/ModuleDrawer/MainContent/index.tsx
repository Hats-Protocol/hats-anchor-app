import { Heading, Stack, Text } from '@chakra-ui/react';
import { Dispatch, SetStateAction } from 'react';
import { UseFormReturn } from 'react-hook-form';

import Accordion from '@/components/atoms/Accordion';
import { useTreeForm } from '@/contexts/TreeFormContext';
import { ModuleDetails, ModuleKind } from '@/types';

import ModuleDetailsForm from './ModuleDetailsForm';
import PermissionlessClaimingForm from './PermissionlessClaimingForm';

const MainContent = ({
  localForm,
  title,
  selectedModuleDetails,
  setSelectedModuleDetails,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  localForm: UseFormReturn<any>;
  title: ModuleKind;
  selectedModuleDetails: ModuleDetails | undefined;
  setSelectedModuleDetails: Dispatch<SetStateAction<ModuleDetails | undefined>>;
}) => {
  const { onchainHats, treeToDisplay, topHatDetails } = useTreeForm();

  if (!onchainHats || !treeToDisplay) return null;

  return (
    <Stack
      p={10}
      pt={8}
      spacing={10}
      w='100%'
      overflow='scroll'
      height='calc(100% - 75px)'
      top={75}
      pos='relative'
    >
      <Stack>
        <Heading color='blackAlpha.800' fontSize={24} fontWeight='medium'>
          Create a new Accountability Module for this hat
        </Heading>
        {topHatDetails?.description && (
          <Text color='blackAlpha.700' noOfLines={2}>
            {topHatDetails?.description}
          </Text>
        )}
      </Stack>

      <Accordion
        title='Module Basics'
        subtitle='The fundamentals of the module, including type and details.'
        open
      >
        <ModuleDetailsForm
          localForm={localForm}
          title={title}
          selectedModuleDetails={selectedModuleDetails}
          setSelectedModuleDetails={setSelectedModuleDetails}
        />
      </Accordion>

      <Accordion
        title='Permissionless Claiming'
        subtitle='Make this hat claimable by deploying a new hatter contract.'
      >
        <PermissionlessClaimingForm localForm={localForm} />
      </Accordion>
    </Stack>
  );
};

export default MainContent;
