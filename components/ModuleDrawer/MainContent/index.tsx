import { Heading, Stack, Text } from '@chakra-ui/react';
import _ from 'lodash';
import { useMemo } from 'react';
import { UseFormReturn } from 'react-hook-form';

import Accordion from '@/components/atoms/Accordion';
// import { MODULE_TYPES } from '@/constants';
import { useTreeForm } from '@/contexts/TreeFormContext';
import useMultiClaimsHatterCheck from '@/hooks/useMultiClaimsHatterCheck';
import { getAllParents, prettyIdToIp } from '@/lib/hats';

import ModuleDetailsForm from './ModuleDetailsForm';
import PermissionlessClaimingForm from './PermissionlessClaimingForm';

const MainContent = ({
  localForm,
  title,
  isStandaloneHatterDeploy,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  localForm: UseFormReturn<any>;
  title: string;
  isStandaloneHatterDeploy?: boolean;
}) => {
  const {
    onchainHats,
    treeToDisplay,
    topHat,
    selectedHat,
    selectedHatDetails,
    topHatDetails,
  } = useTreeForm();

  const parentHats = useMemo(() => {
    const parents = getAllParents(selectedHat?.id, treeToDisplay);
    return _.filter(parents, (parent) => parent !== topHat?.id);
  }, [selectedHat, treeToDisplay, topHat]);

  const { claimableHats } = useMultiClaimsHatterCheck();

  const hatTitle = `${prettyIdToIp(selectedHat?.prettyId)} (${
    selectedHatDetails?.name
  })`;

  if (!onchainHats || !treeToDisplay) return null;

  return (
    <Stack
      p={10}
      pt={8}
      spacing={10}
      w='100%'
      overflow='scroll'
      height='calc(100% - 75px)'
      pb={400}
      top={75}
      pos='relative'
    >
      <Stack>
        <Heading color='blackAlpha.800' fontSize={24} fontWeight='medium'>
          {isStandaloneHatterDeploy
            ? `Deploy a Claims Hatter contract to make hat ${hatTitle} claimable`
            : `Create a new Accountability Module for hat ${hatTitle}`}
        </Heading>
        {topHatDetails?.description && (
          <Text color='blackAlpha.700' noOfLines={2}>
            {topHatDetails?.description}
          </Text>
        )}
      </Stack>

      {!isStandaloneHatterDeploy && (
        <Accordion
          title='Module Basics'
          subtitle='The fundamentals of the module, including type and details.'
          open
        >
          <ModuleDetailsForm localForm={localForm} title={title} />
        </Accordion>
      )}
      {claimableHats && title !== 'toggle' && (
        <Accordion
          title='Permissionless Claiming'
          subtitle='Make this hat claimable by deploying a new hatter contract.'
          open={_.includes(claimableHats, selectedHat?.id)}
        >
          <PermissionlessClaimingForm
            localForm={localForm}
            parentHats={parentHats}
          />
        </Accordion>
      )}
    </Stack>
  );
};

export default MainContent;
