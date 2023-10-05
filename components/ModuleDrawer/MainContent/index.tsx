import { Heading, Stack, Text } from '@chakra-ui/react';
import _ from 'lodash';
import { Dispatch, SetStateAction, useMemo } from 'react';
import { UseFormReturn } from 'react-hook-form';

import Accordion from '@/components/atoms/Accordion';
import { useTreeForm } from '@/contexts/TreeFormContext';
import useCheckMultiClaimsHatter from '@/hooks/useMultiClaimsHatterCheck';
import { getAllParents } from '@/lib/hats';
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
  const { onchainHats, treeToDisplay, topHat, selectedHat, topHatDetails } =
    useTreeForm();

  const parentHats = useMemo(() => {
    const parents = getAllParents(selectedHat?.id, treeToDisplay);
    return _.filter(parents, (parent) => parent !== topHat?.id);
  }, [selectedHat, treeToDisplay, topHat]);

  const { multiClaimsHatter, instanceAddress, claimableHats } =
    useCheckMultiClaimsHatter();
  console.log('multiClaimsHatter', multiClaimsHatter);
  // console.log('instanceAddress', instanceAddress);

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

      {claimableHats && (
        <Accordion
          title='Permissionless Claiming'
          subtitle='Make this hat claimable by deploying a new hatter contract.'
          open={_.includes(claimableHats, selectedHat?.id)}
        >
          <PermissionlessClaimingForm
            localForm={localForm}
            parentHats={parentHats}
            multiClaimsHatter={multiClaimsHatter}
            instanceAddress={instanceAddress}
            isClaimable={_.includes(claimableHats, selectedHat?.id)}
          />
        </Accordion>
      )}
    </Stack>
  );
};

export default MainContent;
