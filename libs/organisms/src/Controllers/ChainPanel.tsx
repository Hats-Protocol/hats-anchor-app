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
import { useWearersEligibilityStatus } from 'hats-hooks';
import { flatten, get, includes, map, pick, size, toLower } from 'lodash';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import { BsCheckSquareFill } from 'react-icons/bs';
import { AppHat, ModuleDetails, SupportedChains } from 'types';
import { Hex } from 'viem';
import { useAccount } from 'wagmi';

import KnownModule from './modules/KnownEligibilityModule';

const RemovedWearer = dynamic(() =>
  import('icons').then((i) => i.RemovedWearer),
);

const ChainPanel = ({ selectedHat, ruleSets, chainId }: ChainPanelProps) => {
  const [expandedBackground, setExpandedBackground] = useState(false);
  const { address } = useAccount();

  const wearerIds = address ? [toLower(address) as Hex] : undefined;
  const { data: wearerStatus } = useWearersEligibilityStatus({
    selectedHat,
    wearerIds,
    chainId: chainId as SupportedChains,
  });

  const isEligible = includes(
    get(wearerStatus, 'eligibleWearers'),
    toLower(address),
  );
  // can assume theres 2+ modules in the ruleSet array already
  // ! currently only supporting single nested chains TODO support deeper nested chains
  const isAndChain = size(ruleSets) === 1;

  return (
    <Accordion allowToggle>
      <AccordionItem
        border='none'
        w={{ base: '100%', md: 'calc(100% + 32px)' }}
        ml={{ md: -4 }}
        boxShadow={
          expandedBackground
            ? '0px 1px 3px 0px rgba(0, 0, 0, 0.10), 0px 1px 2px 0px rgba(0, 0, 0, 0.06)'
            : undefined
        }
        borderRadius={expandedBackground ? 'md' : undefined}
      >
        {({ isExpanded }: { isExpanded: boolean }) => {
          setExpandedBackground(isExpanded);

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
                background={
                  isExpanded
                    ? 'linear-gradient(180deg, #FFF 0%, #FFF 60.01%, #EBF8FF 100%)'
                    : undefined
                }
                borderTopRadius={isExpanded ? 'md' : undefined}
                borderColor={isExpanded ? 'gray.100' : 'transparent'}
                borderBottomColor={isExpanded ? 'gray.400' : 'transparent'}
              >
                <Flex justify='space-between' py={2} px={4} width='100%'>
                  <Text fontSize={{ base: 'sm', md: 'md' }}>
                    Comply with {isAndChain ? 'all' : 'any'} of{' '}
                    {size(flatten(ruleSets))} Rules to claim this Hat
                  </Text>

                  {isEligible ? (
                    <HStack spacing={1} color='green.600'>
                      <Text fontSize={{ base: 'sm', md: 'md' }}>Eligible</Text>

                      <Icon as={BsCheckSquareFill} boxSize={4} />
                    </HStack>
                  ) : (
                    <HStack spacing={1} color='gray.600'>
                      <Text fontSize={{ base: 'sm', md: 'md' }}>
                        Ineligible
                      </Text>

                      <Icon as={RemovedWearer} boxSize={4} />
                    </HStack>
                  )}
                </Flex>
              </AccordionButton>

              <AccordionPanel
                p={0}
                overflow='visible'
                borderBottomRadius='lg'
                pb={1}
                bg='white'
                border='gray'
              >
                <Stack mx={4} pb={2} spacing={0}>
                  {map(ruleSets, (ruleSet: Ruleset, index: number) =>
                    map(ruleSet, (knownModule) => {
                      const { module: moduleDetails, liveParams: parameters } =
                        pick(knownModule, ['module', 'liveParams']);

                      return (
                        <KnownModule
                          key={index}
                          moduleDetails={moduleDetails as ModuleDetails}
                          moduleParameters={parameters}
                          selectedHat={selectedHat}
                          chainId={chainId}
                          wearer={address as Hex}
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
}

export default ChainPanel;
