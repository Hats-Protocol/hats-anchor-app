'use client';

import { Ruleset } from '@hatsprotocol/modules-sdk';
import { every, filter, find, flatten, get, keys, map, size } from 'lodash';
import { useSubscriptionClaim } from 'modules-hooks';
import { useState } from 'react';
import { BsCheckSquare, BsCheckSquareFill, BsFillXOctagonFill } from 'react-icons/bs';
import { AppHat, SupportedChains, WearerStatus } from 'types';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger, cn } from 'ui';
import { eligibilityRuleToModuleDetails } from 'utils';
import { Hex } from 'viem';
import { useAccount } from 'wagmi';

import { KnownEligibilityModule } from './known-eligibility-module';

const IS_CLAIMS_APP = process.env.NEXT_PUBLIC_CLAIMS_APP === 'true';

const EligibilityStatus = ({ isEligible, isReadyToClaim }: { isEligible: boolean; isReadyToClaim: boolean }) => {
  if (isEligible) {
    return (
      <div className='text-functional-success flex items-center gap-1'>
        <p>Eligible</p>

        <BsCheckSquareFill className='h-4 w-4' />
      </div>
    );
  }

  if (isReadyToClaim) {
    return (
      <div className='text-functional-success flex items-center gap-1'>
        <p>Pending</p>

        <BsCheckSquare className='h-4 w-4' />
      </div>
    );
  }

  return (
    <div className='text-destructive flex items-center gap-1'>
      <p>Ineligible</p>

      <BsFillXOctagonFill className='h-4 w-4' />
    </div>
  );
};

const ChainPanel = ({
  selectedHat,
  ruleSets,
  chainId,
  modalSuffix,
  isReadyToClaim: aggregateIsReadyToClaim,
  setIsReadyToClaim,
  currentEligibility,
  defaultOpen = false,
}: ChainPanelProps) => {
  const [open, setOpen] = useState<string>(defaultOpen ? 'chain' : '');
  const { address } = useAccount();
  const expanded = open === 'chain';

  const subscriptionRule = find(flatten(ruleSets), (rule) => rule.module.id.includes('public-lock-v14'));
  const { hasAllowance } = useSubscriptionClaim({
    moduleDetails: subscriptionRule?.module,
    moduleParameters: subscriptionRule?.liveParams,
    chainId,
    handlePendingTx: undefined,
    setStatus: () => {},
  });

  const isEligible = every(keys(currentEligibility), (moduleAddress) => {
    return (
      get(currentEligibility, `${moduleAddress}.eligible`) && get(currentEligibility, `${moduleAddress}.goodStanding`)
    );
  });
  const rulesNotAlreadyClaimed = filter(flatten(ruleSets), (rule) => {
    return (
      !get(currentEligibility, `${rule.address}.eligible`) || !get(currentEligibility, `${rule.address}.goodStanding`)
    );
  });
  const considerSubscriptionRule = filter(rulesNotAlreadyClaimed, (rule) => {
    return !rule.module.id.includes('public-lock-v14') && !hasAllowance;
  });
  const isReadyToClaim = every(considerSubscriptionRule, (rule) => {
    return get(aggregateIsReadyToClaim, rule.address);
  });

  // can assume theres 2+ modules in the ruleSet array already
  // ! currently only supporting single nested chains
  // TODO support deeper nested chains
  const isAndChain = size(ruleSets) === 1;

  // TODO handle controlled accordion // defaultIndex={defaultOpen ? 0 : undefined}
  return (
    <Accordion type='single' className='rounded-md' collapsible value={open} onValueChange={setOpen}>
      <AccordionItem
        className={cn(
          'md:w-[calc(100% + 32px)] w-full rounded-md border-none',
          (IS_CLAIMS_APP || expanded) && 'shadow',
          IS_CLAIMS_APP && 'bg-white/80',
        )}
        value='chain'
      >
        <AccordionTrigger
          className={cn(
            'rounded-md border-b border-b-transparent px-4 py-0 text-base font-light hover:bg-white hover:no-underline',
            IS_CLAIMS_APP && 'py-4',
            !expanded && !IS_CLAIMS_APP ? 'hover:border-b hover:border-blue-300' : 'hover:border-t-gray-100',
            expanded && 'bg-gradient-accordion-trigger rounded-b-none border-b-gray-400',
          )}
        >
          <div className={cn('flex w-full justify-between py-2 pr-2')}>
            <p className={cn('hidden', !IS_CLAIMS_APP && 'block')}>
              Comply with {isAndChain ? 'all' : 'any'} of {size(flatten(ruleSets))} Rules to claim this Hat
            </p>

            <p className={cn('block md:hidden', IS_CLAIMS_APP && 'md:block')}>
              {isAndChain ? 'All ' : 'Any'} of {size(flatten(ruleSets))} Rules to claim
            </p>

            <EligibilityStatus isEligible={!!address && isEligible} isReadyToClaim={isReadyToClaim} />
          </div>
        </AccordionTrigger>

        <AccordionContent className='border-b-lg border-gray border-b-lg border-gray overflow-visible bg-white p-0'>
          <div className={cn('space-y-3 px-4 pb-4 pt-1 text-base')}>
            {/* // TODO fix these nested ternaries */}
            {/* mx={{ base: 0, md: IS_CLAIMS_APP ? (!isMobile ? 6 : 4) : !isMobile ? 4 : 0 }} */}
            {map(ruleSets, (ruleSet: Ruleset, index: number) =>
              map(ruleSet, (rule) => {
                const moduleDetails = eligibilityRuleToModuleDetails(rule);

                return (
                  <KnownEligibilityModule
                    key={`${index}-${rule.address}`}
                    moduleDetails={moduleDetails}
                    moduleParameters={moduleDetails?.liveParameters}
                    selectedHat={selectedHat}
                    chainId={chainId}
                    wearer={address as Hex}
                    modalSuffix={modalSuffix}
                    isReadyToClaim={aggregateIsReadyToClaim}
                    setIsReadyToClaim={setIsReadyToClaim}
                    wearerEligibility={currentEligibility}
                    ruleSets={ruleSets}
                  />
                );
              }),
            )}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

interface ChainPanelProps {
  selectedHat: AppHat | undefined;
  ruleSets: Ruleset[] | undefined;
  chainId: SupportedChains | undefined;
  modalSuffix?: string | undefined;
  isReadyToClaim?: { [key: Hex]: boolean };
  setIsReadyToClaim?: (address: Hex) => void;
  currentEligibility?: { [key: Hex]: WearerStatus };
  defaultOpen?: boolean;
}

export { ChainPanel };
