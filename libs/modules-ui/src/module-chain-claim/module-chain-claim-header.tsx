import { Button, HStack, Icon, Text } from '@chakra-ui/react';
import { useEligibility, useOverlay } from 'contexts';
import { filter, find, first, flatten, get, keys, mapValues, size } from 'lodash';
import { useClaimFn } from 'modules-hooks';
import { useEffect } from 'react';
import { BsCheckSquareFill, BsFillXOctagonFill } from 'react-icons/bs';
import { AppHat, ModuleDetails, SupportedChains } from 'types';
import { Hex } from 'viem';
import { useAccount, useChainId, useSwitchChain } from 'wagmi';

import { ModuleChainClaimButtons } from './module-chain-claim-buttons';

const ModuleChainClaimHeader = ({
  // activeRule,
  // setActiveRule,
  chainId,
}: ModuleChainClaimHeaderProps) => {
  const { address } = useAccount();
  const currentChainId = useChainId();
  const { switchChain } = useSwitchChain();
  const { handlePendingTx } = useOverlay();
  const {
    selectedHat,
    eligibilityRules: rawEligibilityRules,
    currentEligibility,
    isReadyToClaim: aggregateIsReadyToClaim,
    activeRule,
    setActiveRule,
  } = useEligibility();
  const eligibilityRules = flatten(rawEligibilityRules);

  // in cases where there's one module to complete the action and claim the hat, it likely has a readyToClaim status
  const completeToClaim = find(keys(aggregateIsReadyToClaim), (v: string) => get(aggregateIsReadyToClaim, v)); // TODO check that this is the only one/not already eligible
  const ruleToCompleteAndClaim = find(eligibilityRules, (rule) => get(rule, 'address') === completeToClaim);

  useEffect(() => {
    if (activeRule) return;

    setActiveRule(first(eligibilityRules));
    // intentionally excluding setActiveRule from the dependency array
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eligibilityRules, activeRule]);

  const { handleClaim } = useClaimFn({
    selectedHat: selectedHat as AppHat,
    handlePendingTx,
    moduleParameters: ruleToCompleteAndClaim?.liveParams,
    moduleDetails: {
      ...ruleToCompleteAndClaim?.module,
      id: ruleToCompleteAndClaim?.module.id as Hex,
      version: ruleToCompleteAndClaim?.module.version as string,
      instanceAddress: ruleToCompleteAndClaim?.address,
      liveParameters: ruleToCompleteAndClaim?.liveParams,
    } as ModuleDetails,
    chainId: chainId as SupportedChains,
    isReadyToClaim: aggregateIsReadyToClaim,
  });

  const currentEligibilityClaim = mapValues(currentEligibility, (v: { eligible: boolean; goodStanding: boolean }) => {
    return get(v, 'eligible') && get(v, 'goodStanding');
  });
  const combinedReadyToClaim = {
    ...currentEligibilityClaim,
    ...aggregateIsReadyToClaim,
  };

  if (!activeRule?.address || !chainId) return null;

  const handleClaimClick = () => {
    handleClaim();
    // TODO success? is overlay context available?
  };

  const completedRules = size(filter(eligibilityRules, (rule) => get(combinedReadyToClaim, rule.address)));
  const isReadyToClaim = completedRules === size(eligibilityRules);

  // TODO handle not connected

  return (
    <>
      <div className='flex justify-between'>
        <h2 className='text-2xl font-bold'>Comply with {size(eligibilityRules)} rules to claim this role</h2>

        <HStack>
          <Text color={isReadyToClaim ? 'green.500' : 'red.500'} fontWeight='semibold' size='xl'>
            {completedRules}/{size(eligibilityRules)}
          </Text>
          {isReadyToClaim ? (
            <Icon as={BsCheckSquareFill} color='green.500' />
          ) : (
            <Icon as={BsFillXOctagonFill} color='red.500' />
          )}
        </HStack>
      </div>

      <div className='flex items-center justify-between'>
        <ModuleChainClaimButtons />

        {chainId !== currentChainId ? (
          <Button variant='outlineMatch' colorScheme='blue.500' onClick={() => switchChain({ chainId })}>
            Change Chain
          </Button>
        ) : (
          <Button
            isDisabled={!address || chainId !== currentChainId || !isReadyToClaim}
            onClick={handleClaimClick}
            variant='primary'
          >
            Claim
          </Button>
        )}
      </div>
    </>
  );
};

interface ModuleChainClaimHeaderProps {
  // activeRule: EligibilityRule | undefined;
  // setActiveRule: (rule: EligibilityRule | undefined) => void;
  chainId: number | undefined;
}

export default ModuleChainClaimHeader;
