'use client';

import { Ruleset } from '@hatsprotocol/modules-sdk';
import { useMediaStyles } from 'hooks';
import { every, filter, find, flatten, get, keys, map, size } from 'lodash';
import { useSubscriptionClaim } from 'modules-hooks';
import { useEffect, useRef, useState } from 'react';
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
      <div className='flex items-center gap-1 text-green-600'>
        <p>Eligible</p>

        <BsCheckSquareFill className='h-4 w-4' />
      </div>
    );
  }

  if (isReadyToClaim) {
    return (
      <div className='flex items-center gap-1 text-green-600'>
        <p>Pending</p>

        <BsCheckSquare className='h-4 w-4' />
      </div>
    );
  }

  return (
    <div className='flex items-center gap-1 text-red-600'>
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
  const [expandedBackground, setExpandedBackground] = useState(defaultOpen);
  const { address } = useAccount();
  const isMounted = useRef(false);
  const { isMobile } = useMediaStyles();

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

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // TODO handle controlled accordion // defaultIndex={defaultOpen ? 0 : undefined}
  return (
    <Accordion type='single'>
      <AccordionItem
        className={cn(
          '-ml-1 w-full border-none shadow',
          // expandedBackground && 'shadow-accordion-trigger',
          // expandedBackground && 'border-t-md border-t-gray',
        )}
        // border='none'
        // w={{ base: '100%', md: 'calc(100% + 32px)' }}
        // ml={{ md: -4 }}
        // boxShadow={
        //   expandedBackground ? '0px 1px 3px 0px rgba(0, 0, 0, 0.10), 0px 1px 2px 0px rgba(0, 0, 0, 0.06)' : undefined
        // }
        // borderRadius={expandedBackground ? 'md' : undefined}
        value='chain'
      >
        <AccordionTrigger
        // p={0}
        // border={isExpanded ? '1px solid' : undefined}
        // borderBottom={!isExpanded ? '1px solid' : undefined}
        // _hover={{
        //   background: !isExpanded ? 'white' : undefined,
        //   borderRadius: !isExpanded ? 'md' : undefined,
        //   borderColor: !isExpanded && 'blue.300',
        // }}
        // background={isExpanded ? 'linear-gradient(180deg, #FFF 0%, #FFF 60.01%, #EBF8FF 100%)' : undefined}
        // borderTopRadius={isExpanded ? 'md' : undefined}
        // borderColor={isExpanded ? 'gray.100' : 'transparent'}
        // borderBottomColor={isExpanded ? 'gray.400' : 'transparent'}
        >
          <div className={cn('flex w-full justify-between px-4 py-2', IS_CLAIMS_APP && 'md:px-6')}>
            <p className={cn('hidden', !IS_CLAIMS_APP && 'block')}>
              Comply with {isAndChain ? 'all' : 'any'} of {size(flatten(ruleSets))} Rules to claim this Hat
            </p>

            <p className={cn('block', IS_CLAIMS_APP && 'md:hidden')}>
              {isAndChain ? 'All ' : 'Any'} of {size(flatten(ruleSets))} Rules to claim
            </p>

            <EligibilityStatus isEligible={isEligible} isReadyToClaim={isReadyToClaim} />
          </div>
        </AccordionTrigger>

        <AccordionContent className='border-b-lg border-gray border-b-lg border-gray overflow-visible p-0'>
          <div className={cn('mx-0 px-2 pb-2 md:mx-6', IS_CLAIMS_APP && 'md:mx-6 md:px-4')}>
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
