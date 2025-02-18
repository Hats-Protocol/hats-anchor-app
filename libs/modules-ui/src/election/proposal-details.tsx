'use client';

import { useEligibility } from 'contexts';
import { useMediaStyles } from 'hooks';
import { compact, isEmpty, map, orderBy, toNumber } from 'lodash';
import { useMemo } from 'react';
import { BsFileCode } from 'react-icons/bs';
import { FaExternalLinkAlt } from 'react-icons/fa';
import { Badge, Button, Link } from 'ui';
import { eligibilityRuleToModuleDetails, explorerUrl } from 'utils';

export const ProposalDetails = ({ proposal }: { proposal: any }) => {
  const { chainId, activeRule } = useEligibility();
  const moduleDetails = eligibilityRuleToModuleDetails(activeRule);

  const { isMobile } = useMediaStyles();

  const proposalDetails = useMemo(() => {
    if (!proposal) return [];
    return [
      {
        label: 'Strategies:',
        value: proposal.strategies.length === 1 ? '1 strategy' : `${proposal.strategies.length} strategies`,
      },
      {
        label: 'Voting system:',
        value: 'Ranked Choice',
      },
      {
        // TODO handle different relative time labels
        label: 'Started:',
        value: new Date(proposal.start * 1000).toLocaleString(),
      },
      {
        label: 'Ends:',
        value: new Date(proposal.end * 1000).toLocaleString(),
      },
    ];
  }, [proposal]);

  const hasProposalEnded = proposal && proposal.end * 1000 < Date.now();

  const voteResults = useMemo(() => {
    if (!proposal) return [];
    const totalVotes = proposal.scores_total;
    const choices = map(proposal.choices, (choice: string, index: number) => {
      const votes = toNumber(proposal.scores[index].toFixed(2));
      const percentage = totalVotes > 0 ? ((votes / totalVotes) * 100).toFixed(2) : 0;
      return { choice, votes, percentage };
    });

    return orderBy(choices, ['votes'], ['desc']);
  }, [proposal]);

  const snapshotLink = `https://snapshot.org/#/${proposal.space.id}/proposal/${proposal.id}`;

  return (
    <div className='space-y-4'>
      <div>
        <Badge className='uppercase'>{proposal.state}</Badge>
      </div>

      <div className='flex w-full flex-col items-start gap-6 md:flex-row'>
        <div className='flex-1 space-y-4'>
          <Link href={snapshotLink} isExternal>
            <h3 className='text-lg'>{proposal.title}</h3>
          </Link>

          <p className='text-sm'>{proposal.body}</p>
        </div>

        <div className='w-full flex-1 md:w-auto'>
          <h3 className='text-sm'>About</h3>
          {moduleDetails && (
            <Link href={`${explorerUrl(chainId)}/address/${moduleDetails?.implementationAddress}`} isExternal>
              <div className='flex gap-1'>
                <BsFileCode className='text-teal-500' />

                <p className='text-sm text-teal-500'>Election</p>
              </div>
            </Link>
          )}
        </div>

        {map(compact(proposalDetails), (detail: any) => (
          <div className='flex w-full justify-between gap-1' key={detail.label}>
            <p className='text-sm'>{detail.label}</p>

            <p className='text-sm'>{detail.value}</p>
          </div>
        ))}
      </div>

      {!isEmpty(voteResults) && (
        <div className='space-y-2'>
          <h3 className='text-sm'>Current Results</h3>

          {map(voteResults, (result: any) => (
            <div key={result.choice} className='w-full space-y-1'>
              <div className='flex w-full justify-between'>
                <p>{result.choice}</p>
                {!isMobile ? (
                  <p className='text-right text-sm font-medium text-gray-500'>
                    {result.votes} VOTES ({result.percentage}%)
                  </p>
                ) : (
                  <p className='text-right text-sm font-medium text-gray-500'>{result.percentage}%</p>
                )}
              </div>
              {/* <Progress colorScheme='blue' borderRadius={4} size='sm' value={Number(result.percentage)} /> */}
            </div>
          ))}
        </div>
      )}

      <div className='flex justify-center'>
        <Link href={snapshotLink}>
          <Button size='sm'>
            {!hasProposalEnded ? 'Vote now' : 'View'} on Snapshot
            <FaExternalLinkAlt className='ml-1 h-4 w-4' />
          </Button>
        </Link>
      </div>
    </div>
  );
};
