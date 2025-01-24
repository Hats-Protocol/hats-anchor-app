'use client';

import {
  Accordion,
  AccordionButton,
  AccordionItem,
  AccordionPanel,
  Flex,
  HStack,
  Icon,
  Stack,
  Text,
} from '@chakra-ui/react';
import { Ruleset } from '@hatsprotocol/modules-sdk';
import { useMediaStyles } from 'hooks';
import { every, filter, find, flatten, get, keys, map, size } from 'lodash';
import { useSubscriptionClaim } from 'modules-hooks';
import { startTransition, useEffect, useRef, useState } from 'react';
import { BsCheckSquare, BsCheckSquareFill, BsFillXOctagonFill } from 'react-icons/bs';
import { AppHat, SupportedChains, WearerStatus } from 'types';
import { eligibilityRuleToModuleDetails } from 'utils';
import { Hex } from 'viem';
import { useAccount } from 'wagmi';

import { KnownEligibilityModule } from './known-eligibility-module';

const IS_CLAIMS_APP = process.env.NEXT_PUBLIC_CLAIMS_APP === 'true';

const EligibilityStatus = ({ isEligible, isReadyToClaim }: { isEligible: boolean; isReadyToClaim: boolean }) => {
  if (isEligible) {
    return (
      <HStack spacing={1} color='green.600'>
        <Text>Eligible</Text>

        <Icon as={BsCheckSquareFill} boxSize={4} />
      </HStack>
    );
  }

  if (isReadyToClaim) {
    return (
      <HStack spacing={1} color='green.600'>
        <Text>Pending</Text>

        <Icon as={BsCheckSquare} boxSize={4} />
      </HStack>
    );
  }

  return (
    <HStack spacing={1} color='red.600'>
      <Text>Ineligible</Text>

      <Icon as={BsFillXOctagonFill} boxSize={4} />
    </HStack>
  );
};

export const ChainPanel = ({
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

  return (
    <Accordion allowToggle defaultIndex={defaultOpen ? 0 : undefined}>
      <AccordionItem
        border='none'
        w={{ base: '100%', md: 'calc(100% + 32px)' }}
        ml={{ md: -4 }}
        boxShadow={
          expandedBackground ? '0px 1px 3px 0px rgba(0, 0, 0, 0.10), 0px 1px 2px 0px rgba(0, 0, 0, 0.06)' : undefined
        }
        borderRadius={expandedBackground ? 'md' : undefined}
      >
        {({ isExpanded }: { isExpanded: boolean }) => {
          if (isMounted.current && isExpanded !== expandedBackground) {
            startTransition(() => setExpandedBackground(isExpanded));
          }

          return (
            <>
              <AccordionButton
                p={0}
                border={isExpanded ? '1px solid' : undefined}
                borderBottom={!isExpanded ? '1px solid' : undefined}
                _hover={{
                  background: !isExpanded ? 'white' : undefined,
                  borderRadius: !isExpanded ? 'md' : undefined,
                  borderColor: !isExpanded && 'blue.300',
                }}
                background={isExpanded ? 'linear-gradient(180deg, #FFF 0%, #FFF 60.01%, #EBF8FF 100%)' : undefined}
                borderTopRadius={isExpanded ? 'md' : undefined}
                borderColor={isExpanded ? 'gray.100' : 'transparent'}
                borderBottomColor={isExpanded ? 'gray.400' : 'transparent'}
              >
                <Flex justify='space-between' py={2} px={{ base: 4, md: IS_CLAIMS_APP ? 6 : 4 }} width='100%'>
                  <Text
                    display={{
                      base: 'none',
                      md: IS_CLAIMS_APP ? 'none' : 'block',
                    }}
                  >
                    Comply with {isAndChain ? 'all' : 'any'} of {size(flatten(ruleSets))} Rules to claim this Hat
                  </Text>
                  <Text
                    display={{
                      base: 'block',
                      md: IS_CLAIMS_APP ? 'block' : 'none',
                    }}
                  >
                    {isAndChain ? 'All ' : 'Any'} of {size(flatten(ruleSets))} Rules to claim
                  </Text>

                  <EligibilityStatus isEligible={isEligible} isReadyToClaim={isReadyToClaim} />
                </Flex>
              </AccordionButton>

              <AccordionPanel p={0} overflow='visible' borderBottomRadius='lg' pb={1} bg='white' border='gray'>
                <Stack
                  // TODO fix these nested ternaries
                  mx={{ base: 0, md: IS_CLAIMS_APP ? (!isMobile ? 6 : 4) : !isMobile ? 4 : 0 }}
                  pb={2}
                  spacing={0}
                  // px={{ base: 2, md: IS_CLAIMS_APP ? 4 : 0 }}
                >
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
                </Stack>
              </AccordionPanel>
            </>
          );
        }}
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

export default ChainPanel;
