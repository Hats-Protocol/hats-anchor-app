'use client';

import { useEligibility } from 'contexts';
import { useMediaStyles } from 'hooks';
import { Card, Skeleton } from 'ui';

import { CurrentSeason } from './current-season';
import { ElectionRoles } from './election-roles';
import { ProposalView } from './proposal-view';
import { UpcomingSeason } from './upcoming-season';
import { WearersList } from './wearers-list';

export const ElectionClaims = () => {
  const {
    chainId,
    // selectedHat,
    // selectedHatDetails,
    isEligibilityRulesLoading,
  } = useEligibility();
  const { isClient, isMobile } = useMediaStyles();

  if (!chainId) return null;
  // const chain = chainsMap(chainId);

  // let title = '';
  // if (selectedHat && selectedHatDetails) {
  //   title = `${selectedHatDetails.name} on ${chain.name}`;
  // } else if (selectedHat) {
  //   title = `Hat #${hatIdDecimalToIp(BigInt(_.get(selectedHat, 'id')))} on ${
  //     chain.name
  //   }`;
  // }

  // should be loaded and know if it's election eligibility
  if (!isClient || isEligibilityRulesLoading) {
    return <Skeleton className='min-h-[500px] w-full rounded-lg' />;
  }

  return (
    <div className='flex flex-col gap-10'>
      <div className='flex w-full gap-6'>
        <Card className='min-h-[90px] w-full p-4 md:w-1/2'>
          <CurrentSeason />
        </Card>

        <Card className='md:inherit hidden min-h-[90px] w-full p-4 md:w-1/2'>
          <UpcomingSeason />
        </Card>
      </div>

      <div className='flex w-full gap-6'>
        <Card className='h-full min-h-[90px] w-full p-4 md:w-1/2'>
          <WearersList />
        </Card>

        <Card className='md:inherit hidden h-full min-h-[90px] w-full p-4 md:w-1/2'>
          <ElectionRoles />
        </Card>
      </div>

      <Card className='min-h-[300px] w-full p-4'>
        <ProposalView />
      </Card>

      {isMobile && (
        <>
          <Card className='min-h-[300px] w-full p-4'>
            <UpcomingSeason />
          </Card>

          <Card className='md:inherit hidden h-full w-full p-4'>
            <ElectionRoles />
          </Card>
        </>
      )}
    </div>
  );
};
