'use client';

import { CONFIG } from '@hatsprotocol/config';
import { useQuery } from '@tanstack/react-query';
import { useEligibility } from 'contexts';
import { useWearerDetails } from 'hats-hooks';
import { capitalize, get, includes, map, toNumber } from 'lodash';
import { useAgreementClaim } from 'modules-hooks';
import { AgreementContent } from 'molecules';
import { useMemo } from 'react';
import { BsCheckCircleFill, BsCheckSquare } from 'react-icons/bs';
import { Button, cn, Tooltip } from 'ui';
import { eligibilityRuleToModuleDetails, fetchIpfs } from 'utils';
import { Hex } from 'viem';
import { useAccount } from 'wagmi';

// TODO use existing utils
const handleFetchIpfs: any = async (ipfsHash: string) => {
  return fetchIpfs(ipfsHash)
    .then((res: any) => {
      return get(res, 'data', null);
    })
    .catch((err: Error) => {
      // eslint-disable-next-line no-console
      console.error(err);
      return null;
    });
};

const AgreementButton = () => {
  const {
    selectedHat,
    chainId,
    isClaimableFor,
    isReadyToClaim: aggregateIsReadyToClaim,
    activeRule,
    setIsReadyToClaim,
  } = useEligibility();
  const moduleDetails = eligibilityRuleToModuleDetails(activeRule);

  const { address } = useAccount();

  const { data: wearerHats } = useWearerDetails({
    wearerAddress: address as Hex,
    chainId,
  });

  const isWearing = useMemo(() => includes(map(wearerHats, 'id'), selectedHat?.id), [wearerHats, selectedHat?.id]);
  const hasSupply = useMemo(
    () => toNumber(selectedHat?.maxSupply) - toNumber(selectedHat?.currentSupply) > 0,
    [selectedHat],
  );
  const isReadyToClaim = useMemo(() => {
    if (!moduleDetails?.instanceAddress) return false;

    return get(aggregateIsReadyToClaim, moduleDetails.instanceAddress);
  }, [aggregateIsReadyToClaim, moduleDetails?.instanceAddress]);

  let buttonTooltip = '';
  if (isWearing) {
    buttonTooltip = 'You are wearing this hat.';
  } else if (!hasSupply) {
    buttonTooltip = 'No hats left to claim. If this hat is mutable an admin could increase the supply.';
  } else if (!isClaimableFor && selectedHat?.id !== CONFIG.agreementV0.communityHatId) {
    buttonTooltip = 'Please allow any account to claim this Hat on behalf of eligible users.';
  }
  // else if (!isReadyToClaim) {
  //   buttonTooltip = 'Review the hat details and conditions to claim.';
  // }

  const localClaimable = !isClaimableFor && selectedHat?.id !== CONFIG.agreementV0.communityHatId;

  return (
    <Tooltip label={buttonTooltip}>
      <Button
        variant={isReadyToClaim ? 'outline' : 'default'}
        className={cn('border py-4', isReadyToClaim ? 'border-green-500 bg-transparent text-green-500' : 'bg-blue-500')}
        size='sm'
        onClick={() => {
          if (!moduleDetails?.instanceAddress) return;
          setIsReadyToClaim(moduleDetails.instanceAddress);
        }}
        disabled={localClaimable || !hasSupply || isWearing || isReadyToClaim}
      >
        {isReadyToClaim ? <BsCheckSquare /> : <BsCheckCircleFill />}
        {isReadyToClaim ? 'Accepted' : 'Accept Agreement'}
      </Button>
    </Tooltip>
  );
};

// SUPPORTS v0 and v1
export const AgreementClaims = () => {
  const { activeRule, selectedHatDetails } = useEligibility();
  const moduleDetails = eligibilityRuleToModuleDetails(activeRule);

  const { agreement } = useAgreementClaim({
    moduleParameters: moduleDetails?.liveParameters,
  });

  const { data: agreementV0 } = useQuery({
    queryKey: ['agreementV0'],
    queryFn: () => handleFetchIpfs(CONFIG.agreementV0.ipfsHash),
    enabled: !agreement,
  });

  return (
    <div className='flex w-full flex-col gap-4'>
      <div className='flex flex-1 items-center justify-between gap-10 bg-white p-5'>
        <h2>
          Sign the agreement to claim the {get(selectedHatDetails, 'name')} {capitalize(CONFIG.TERMS.hat)}
        </h2>

        <div className='flex min-w-[175px] justify-end'>
          <AgreementButton />
        </div>

        <AgreementContent agreement={agreement || agreementV0} />
      </div>

      <div>
        <AgreementButton />
      </div>
    </div>
  );
};
