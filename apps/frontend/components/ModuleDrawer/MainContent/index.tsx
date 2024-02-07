import { Heading, Stack, Text } from '@chakra-ui/react';
import { useMultiClaimsHatterCheck } from 'hats-hooks';
import { AppHat } from 'hats-types';
import { getAllParents } from 'hats-utils';
import _ from 'lodash';
import { useMemo } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { prettyIdToIp } from 'shared';
import { Accordion } from 'ui';

import { useTreeForm } from '../../../contexts/TreeFormContext';
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
    chainId,
    storedData,
    editMode,
  } = useTreeForm();

  const eligibleParentHats = useMemo(() => {
    const parents = getAllParents(selectedHat?.id, treeToDisplay);
    // not top hat and (immutable with supply or mutable)
    return _.filter(
      parents,
      (parent: AppHat) =>
        parent.id !== topHat?.id &&
        parent.id !== selectedHat?.id && // not top hat or selected hat
        (parent.mutable ||
          _.toNumber(parent.maxSupply) > _.toNumber(parent.currentSupply)),
    ) as AppHat[];
  }, [selectedHat, treeToDisplay, topHat]);

  const { claimableHats } = useMultiClaimsHatterCheck({
    chainId,
    selectedHat,
    onchainHats,
    storedData,
    editMode,
  });

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
        <Heading size='2xl' variant='lightMedium'>
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
            parentHats={eligibleParentHats}
          />
        </Accordion>
      )}
    </Stack>
  );
};

export default MainContent;
