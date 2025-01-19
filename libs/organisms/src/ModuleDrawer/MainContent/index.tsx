'use client';

import { Heading, Stack, Text } from '@chakra-ui/react';
import { useSelectedHat, useTreeForm } from 'contexts';
import { getAllParents } from 'hats-utils';
import { filter, toNumber } from 'lodash';
import { useMultiClaimsHatterCheck } from 'modules-hooks';
import { useMemo } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { prettyIdToIp } from 'shared';
import { AppHat } from 'types';
import { Accordion } from 'ui';

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
  const { onchainHats, treeToDisplay, topHat, topHatDetails, chainId, storedData, editMode } = useTreeForm();
  const { selectedHat, selectedHatDetails } = useSelectedHat();

  const eligibleParentHats = useMemo(() => {
    const parents = getAllParents(selectedHat?.id, treeToDisplay);
    // not top hat and (immutable with supply or mutable)
    return filter(
      parents,
      (parent: AppHat) =>
        parent.id !== topHat?.id &&
        parent.id !== selectedHat?.id && // not top hat or selected hat
        (parent.mutable || toNumber(parent.maxSupply) > toNumber(parent.currentSupply)),
    ) as AppHat[];
  }, [selectedHat, treeToDisplay, topHat]);

  const { claimableHats } = useMultiClaimsHatterCheck({
    chainId,
    selectedHat,
    onchainHats,
    storedData,
    editMode,
  });

  const hatTitle = `${prettyIdToIp(selectedHat?.prettyId)} (${selectedHatDetails?.name})`;

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
          <Text variant='light' noOfLines={2}>
            {topHatDetails?.description}
          </Text>
        )}
      </Stack>

      {!isStandaloneHatterDeploy && (
        <Accordion title='Module Basics' subtitle='The fundamentals of the module, including type and details.' open>
          <ModuleDetailsForm localForm={localForm} title={title} />
        </Accordion>
      )}
      {claimableHats && title !== 'toggle' && (
        <Accordion
          title='Permissionless Claiming'
          subtitle='Make this hat claimable by deploying a new hatter contract.'
          open
        >
          <PermissionlessClaimingForm localForm={localForm} parentHats={eligibleParentHats} />
        </Accordion>
      )}
    </Stack>
  );
};

export default MainContent;
