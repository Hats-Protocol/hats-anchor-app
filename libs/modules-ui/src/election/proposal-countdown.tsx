'use client';

import { useEligibility } from 'contexts';
import { keys, map, toString } from 'lodash';
import React, { useEffect, useState } from 'react';
import { BsFileCode } from 'react-icons/bs';
import { FaExternalLinkAlt } from 'react-icons/fa';
import { Badge, Link, LinkButton } from 'ui';
import { eligibilityRuleToModuleDetails, explorerUrl } from 'utils';

interface TimeUntilStart {
  days: number;
  hours: number;
  minutes: number;
}

interface ProposalCountdownProps {
  start: number;
  title: string;
  proposalId: string;
  spaceId: string;
}

export const ProposalCountdown: React.FC<ProposalCountdownProps> = ({ start, title, proposalId, spaceId }) => {
  const [timeUntilStart, setTimeUntilStart] = useState<TimeUntilStart>();
  const { chainId, activeRule } = useEligibility();
  const moduleDetails = eligibilityRuleToModuleDetails(activeRule);
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const startTime = new Date(start * 1000);
      const timeLeft = startTime.getTime() - now.getTime();
      if (timeLeft < 0) {
        return;
      }
      const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
      const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

      setTimeUntilStart({ days, hours, minutes });
    };

    updateCountdown();
    const intervalId = setInterval(updateCountdown, 5000);

    return () => clearInterval(intervalId);
  }, [start]);

  return (
    <div className='space-y-4'>
      <div className='flex w-full justify-between'>
        <div>
          <Badge className='uppercase'>Upcoming</Badge>
          <h3 className='text-md'>{title}</h3>
        </div>
        {moduleDetails && (
          <Link href={`${explorerUrl(chainId)}/address/${moduleDetails?.implementationAddress}`} isExternal>
            <div className='flex gap-1'>
              <BsFileCode className='text-teal-500' />
              <p className='text-sm text-teal-500'>Election</p>
            </div>
          </Link>
        )}
      </div>
      <div className='grid grid-cols-3 gap-4'>
        {map(keys(timeUntilStart), (key) => (
          <div key={key} className='flex flex-col gap-1'>
            <div className='rounded-md border border-gray-200 px-3 py-4'>
              <p className='text-4xl'>{toString(timeUntilStart?.[key as keyof TimeUntilStart])}</p>
            </div>
            <p className='text-sm'>{key}</p>
          </div>
        ))}
      </div>
      <LinkButton variant='link' href={`https://snapshot.org/#/${spaceId}/proposal/${proposalId}`} isExternal size='sm'>
        Preview on Snapshot
        <FaExternalLinkAlt className='ml-1 h-4 w-4' />
      </LinkButton>
    </div>
  );
};
