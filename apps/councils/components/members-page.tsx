'use client';

import { Button, Checkbox, Icon } from '@chakra-ui/react';
import { useCouncilDetails } from 'hooks';
import { filter, first, get, map, split, toLower } from 'lodash';
import { useAllowlist, useEligibilityRules } from 'modules-hooks';
import { BsCheckSquareFill } from 'react-icons/bs';
import { SupportedChains } from 'types';
import { Skeleton } from 'ui';
import { formatAddress, parseCouncilSlug } from 'utils';
import { Hex } from 'viem';

// TODO hardcode
const selectionModule = '0x8250a44405C4068430D3B3737721D47bB614E7D2';
const criteriaModule = '0x03aB59ff1Ab959F2663C38408dD2578D149e4cd5';

const MembersPage = ({ slug }: { slug: string }) => {
  const { chainId, address } = parseCouncilSlug(slug);
  const { data: councilDetails, isLoading: councilDetailsLoading } =
    useCouncilDetails({
      chainId: chainId ?? 11155111,
      address,
    });
  const primarySignerHat = get(councilDetails, 'signerHats[0]');
  const { data: eligibilityRules, isLoading: eligibilityRulesLoading } =
    useEligibilityRules({
      address: toLower(get(primarySignerHat, 'eligibility')) as Hex,
      chainId: (chainId ?? 11155111) as SupportedChains,
    });
  // TODO fetch module labels

  const { data: allowlist } = useAllowlist({
    id: selectionModule,
    chainId: (chainId ?? 11155111) as SupportedChains,
  });

  const remainingModules = filter(
    first(eligibilityRules),
    (rule) => toLower(rule.address) !== toLower(selectionModule),
  );

  if (councilDetailsLoading || eligibilityRulesLoading) {
    return (
      <div className='flex flex-col gap-4'>
        <Skeleton className='h-12 w-full' />
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton className='h-16 w-full' key={index} />
        ))}
      </div>
    );
  }

  return (
    <div className='flex flex-col'>
      <div className='flex h-12 items-center justify-between border-b border-t border-gray-200'>
        <div className='flex items-center'>
          <div className='w-12' />
          <div className='flex h-full w-[250px] items-center p-2'>
            <p>Council Member</p>
          </div>
        </div>

        <div className='flex items-center'>
          <div className='flex h-full w-28 items-center justify-center'>
            <p className='text-center'>Allowed</p>
          </div>
          {map(remainingModules, (rule) => {
            if (toLower(rule.address) === toLower(criteriaModule)) {
              return (
                <div
                  className='flex h-full w-28 items-center justify-center'
                  key={rule.address}
                >
                  <p className='text-center'>Compliance</p>
                </div>
              );
            }

            return (
              <div
                className='flex h-full w-28 items-center justify-center'
                key={rule.address}
              >
                <p className='text-center'>
                  {first(split(rule.module.name, ' '))}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {map(allowlist, (member: { address: Hex }) => (
        <div
          className='flex h-16 justify-between border-b border-gray-200'
          key={member.address}
        >
          <div className='flex items-center'>
            <div className='flex w-12 items-center justify-center'>
              <Checkbox />
            </div>
            <div
              className='flex h-full w-[250px] items-center p-2'
              key={member.address}
            >
              <p>{formatAddress(member.address)}</p>
            </div>
          </div>

          <div className='flex items-center'>
            <div className='flex h-full w-28 items-center justify-center'>
              <Icon as={BsCheckSquareFill} color='green.500' />
            </div>

            {map(remainingModules, (rule) => (
              <div
                className='flex h-full w-28 items-center justify-center'
                key={rule.address}
              >
                <Icon
                  as={BsCheckSquareFill}
                  color='red.500'
                  key={`${rule.address}-${member.address}`}
                />
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className='flex pt-8'>
        <Button variant='outline'>Update Members</Button>
      </div>
    </div>
  );
};

export default MembersPage;
