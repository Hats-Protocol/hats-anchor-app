'use client';

import { useEligibility } from 'contexts';
import { useMediaStyles } from 'hooks';
import { LabeledModules, ModuleDetails } from 'types';
import { Card, cn, Skeleton } from 'ui';

import { CurrentSeason } from './current-season';
import { ElectionRoles } from './election-roles';
import { ProposalView } from './proposal-view';
import { UpcomingSeason } from './upcoming-season';
import { WearersList } from './wearers-list';

export const ElectionClaims = ({
  activeModule,
  labeledModules,
  showOnMobile = false,
}: {
  activeModule?: ModuleDetails;
  labeledModules?: LabeledModules | undefined;
  showOnMobile?: boolean;
}) => {
  const { chainId, isEligibilityRulesLoading } = useEligibility();
  const { isClient } = useMediaStyles();

  if (!chainId) return null;

  if (!isClient || isEligibilityRulesLoading) {
    return <Skeleton className='min-h-[500px] w-full rounded-lg' />;
  }

  return (
    <div
      className={cn('flex flex-col gap-10', {
        'hidden md:flex': !showOnMobile,
        'flex md:flex': showOnMobile,
      })}
    >
      <div className='flex w-full gap-6 border-[#2D3748]'>
        <Card className='min-h-[90px] w-full p-4 md:w-1/2'>
          <CurrentSeason />
        </Card>

        <Card className='md:inherit hidden min-h-[90px] w-full p-4 md:w-1/2'>
          <UpcomingSeason />
        </Card>
      </div>

      <div className='flex w-full gap-6'>
        <Card className='h-full min-h-[90px] w-full border-[#2D3748] p-4 md:w-1/2'>
          <WearersList />
        </Card>

        <Card className='md:inherit hidden h-full min-h-[90px] w-full border-[#2D3748] p-4 md:w-1/2'>
          <ElectionRoles />
        </Card>
      </div>

      <Card className='min-h-[300px] w-full border-[#2D3748] p-4'>
        <ProposalView />
      </Card>

      {showOnMobile && (
        <>
          <Card className='min-h-[300px] w-full border-[#2D3748] p-4'>
            <UpcomingSeason />
          </Card>

          <Card className='h-full w-full border-[#2D3748] p-4'>
            <ElectionRoles />
          </Card>
        </>
      )}
    </div>
  );
};
