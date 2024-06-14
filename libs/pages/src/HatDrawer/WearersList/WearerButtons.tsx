import { Button, Flex, HStack, Text, Tooltip } from '@chakra-ui/react';
import { useOverlay, useSelectedHat, useTreeForm } from 'contexts';
import {
  useHatClaimBy,
  useMultiClaimsHatterCheck,
  useWearerDetails,
  useWearerEligibilityCheck,
  useWearersEligibilityCheck,
} from 'hats-hooks';
import { isWearingAdminHat } from 'hats-utils';
import { useMediaStyles } from 'hooks';
import _ from 'lodash';
import { useMemo } from 'react';
import { FaPlus } from 'react-icons/fa';
import { useAccount, useChainId } from 'wagmi';

const claimTooltip = ({
  claimFor,
  sameChain,
  hatterIsAdmin,
}: {
  claimFor: boolean;
  sameChain: boolean;
  hatterIsAdmin: boolean;
}) => {
  if (!sameChain)
    return claimFor
      ? "You can't claim this hat for a wearer from a different chain"
      : "You can't claim a hat from a different chain.";
  if (!hatterIsAdmin)
    return claimFor
      ? 'Hatter must be wearing an admin hat to claim this hat for a wearer.'
      : 'Hatter must be wearing an admin hat to claim this hat.';
  return undefined;
};

const addWearerTooltip = (sameChain, maxWearersReached) => {
  if (!sameChain) return "You can't add a wearer from a different chain.";
  if (maxWearersReached) return 'Maximum number of wearers reached.';

  return undefined;
};

const WearerButtons = () => {
  const { setModals, handlePendingTx } = useOverlay();
  const { isMobile } = useMediaStyles();
  const { chainId, onchainHats, storedData } = useTreeForm();
  const { selectedHat } = useSelectedHat();
  const { address } = useAccount();
  const currentNetworkId = useChainId();

  const { data: wearersEligibility } = useWearersEligibilityCheck({
    selectedHat,
    chainId,
  });
  const { eligibleWearers: eligibleWearerIds } = useMemo(
    () => _.pick(wearersEligibility, ['eligibleWearers']),
    [wearersEligibility],
  );

  const { data: wearer } = useWearerDetails({
    wearerAddress: address,
    chainId,
    editMode: false, // change if used in edit mode
  });
  const currentUserIsWearing = useMemo(
    () => _.find(wearer, { id: selectedHat?.id }),
    [selectedHat?.id, wearer],
  );

  const { data: currentUserIsEligible } = useWearerEligibilityCheck({
    wearer: address,
    selectedHat,
    chainId,
  });

  const { claimHat, hatterIsAdmin, isClaimable } = useHatClaimBy({
    selectedHat,
    chainId,
    wearer: address,
    handlePendingTx,
  });

  const { currentHatIsClaimable } = useMultiClaimsHatterCheck({
    selectedHat,
    chainId,
    onchainHats,
    editMode: false, // change if used in edit mode
    storedData,
  });

  const isAdminUser = isWearingAdminHat(_.map(wearer, 'id'), selectedHat?.id);

  const maxWearersReached = _.gte(
    _.size(eligibleWearerIds),
    _.toNumber(selectedHat?.maxSupply),
  );

  // order of button priority
  // 0. show all wearers
  // 1. claim hat for wearer
  // 2. add wearer (for admins)
  // 3. claim hat

  return (
    <Flex justify='space-between' align='center' px={{ base: 4, md: 16 }}>
      {_.gt(_.size(eligibleWearerIds), 4) && (
        <Text
          onClick={() => setModals?.({ hatWearers: true })}
          cursor='pointer'
          _hover={{
            textDecor: 'underline',
          }}
          color='Functional-LinkSecondary'
          size={{ base: 'sm', md: 'md' }}
          // TODO technically not taking into account eligibility here
        >
          Show all {_.get(selectedHat, 'currentSupply')} wearers
        </Text>
      )}

      {!isMobile && (
        <>
          {!isAdminUser && currentHatIsClaimable?.for && address && (
            <Tooltip
              label={claimTooltip({
                claimFor: true,
                sameChain: chainId === currentNetworkId,
                hatterIsAdmin: hatterIsAdmin as boolean,
              })}
              fontSize='md'
              shouldWrapChildren
            >
              <Button
                variant='unstyled'
                isDisabled={
                  maxWearersReached ||
                  !hatterIsAdmin ||
                  chainId !== currentNetworkId
                }
                // isLoading={isLoading}
                onClick={() =>
                  !maxWearersReached ? setModals?.({ claimFor: true }) : {}
                }
              >
                <HStack color='blue.500'>
                  <FaPlus />
                  <Text>Claim hat for wearer</Text>
                </HStack>
              </Button>
            </Tooltip>
          )}
          {(currentUserIsEligible as boolean) &&
            !!isClaimable &&
            !currentHatIsClaimable?.for &&
            !isAdminUser &&
            !currentUserIsWearing && (
              <Tooltip
                label={claimTooltip({
                  claimFor: false,
                  sameChain: chainId === currentNetworkId,
                  hatterIsAdmin: hatterIsAdmin as boolean,
                })}
                fontSize='md'
                shouldWrapChildren
              >
                <Button
                  variant='unstyled'
                  isDisabled={
                    !claimHat ||
                    maxWearersReached ||
                    !hatterIsAdmin ||
                    chainId !== currentNetworkId
                  }
                  onClick={claimHat}
                >
                  <HStack color='blue.500'>
                    <FaPlus />
                    <Text>Claim Hat</Text>
                  </HStack>
                </Button>
              </Tooltip>
            )}
          {isAdminUser && (
            <Tooltip
              label={addWearerTooltip(
                chainId === currentNetworkId,
                maxWearersReached,
              )}
              fontSize='md'
              isDisabled={!maxWearersReached && chainId === currentNetworkId}
              shouldWrapChildren
            >
              <Button
                variant='unstyled'
                isDisabled={maxWearersReached || chainId !== currentNetworkId}
                onClick={() =>
                  !maxWearersReached ? setModals?.({ newWearer: true }) : {}
                }
              >
                <HStack
                  cursor={maxWearersReached ? 'not-allowed' : 'pointer'}
                  color={maxWearersReached ? 'gray.500' : 'blue.500'}
                >
                  <FaPlus />
                  <Text>Add a wearer</Text>
                </HStack>
              </Button>
            </Tooltip>
          )}
        </>
      )}
    </Flex>
  );
};

export default WearerButtons;
