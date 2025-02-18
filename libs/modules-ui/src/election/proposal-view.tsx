'use client';

import { PROPOSALS } from '@hatsprotocol/config';
import { useEligibility } from 'contexts';
import { useProposalDetails } from 'hooks';
import { get, pick } from 'lodash';
import { idToIp } from 'shared';
import { Skeleton } from 'ui';

import { ProposalCountdown } from './proposal-countdown';
import { ProposalDetails } from './proposal-details';

// TODO fix hardcoded proposal id here

export const ProposalView = () => {
  const { selectedHat, chainId } = useEligibility();

  // Assuming the structure of PROPOSALS is corrected as needed
  const { execute, elect } = pick(
    get(
      get(
        get(PROPOSALS, chainId as number), // chain first
        idToIp(selectedHat?.id), // then hat id
      ),
      107187481, // followed by proposal id
    ),
    ['execute', 'elect'],
  );

  const proposalId = chainId && (execute || elect);
  const { data: proposal, isLoading, error } = useProposalDetails(proposalId);
  const hasProposalStarted = proposal && proposal.start * 1000 <= Date.now();

  if (isLoading) return <Skeleton className='min-h-[500px] w-full rounded-lg' />;
  if (error || !proposal) return <p>Failed to load proposal details.</p>;

  return (
    <div className='flex flex-col gap-4'>
      {!hasProposalStarted && (
        <ProposalCountdown
          start={proposal.start}
          title={proposal.title}
          proposalId={proposal.id}
          spaceId={proposal.space.id}
        />
      )}
      {hasProposalStarted && <ProposalDetails proposal={proposal} />}
    </div>
  );
};
