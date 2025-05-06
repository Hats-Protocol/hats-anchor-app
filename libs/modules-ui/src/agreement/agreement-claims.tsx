'use client';

import { CONFIG } from '@hatsprotocol/config';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEligibility } from 'contexts';
import { useWearerDetails } from 'hats-hooks';
import { capitalize, flatten, get, includes, map, size, some, toNumber } from 'lodash';
import { useAgreementClaim } from 'modules-hooks';
import { AgreementContent } from 'molecules';
import { useMemo } from 'react';
import { BsCheckCircleFill, BsCheckSquare, BsCheckSquareFill } from 'react-icons/bs';
import { EligibilityRule, HatDetails, LabeledModules, ModuleDetails } from 'types';
import { Button, Card, cn, Tooltip } from 'ui';
import { fetchIpfs } from 'utils';
import { Hex } from 'viem';
import { useAccount } from 'wagmi';

type FetchIpfsResponse = {
  details: string;

  data: HatDetails | null;
} | null;

const handleFetchIpfs = async (ipfsHash: string) => {
  return fetchIpfs(ipfsHash)
    .then((res: FetchIpfsResponse) => {
      return get(res, 'data', null);
    })
    .catch((err: Error) => {
      // eslint-disable-next-line no-console
      console.error(err);
      return null;
    });
};

const AgreementButton = ({ activeModule }: { activeModule: ModuleDetails }) => {
  const queryClient = useQueryClient();
  const {
    selectedHat,
    chainId,
    isClaimableFor,
    isReadyToClaim: aggregateReadyToClaim,
    setIsReadyToClaim,
    eligibilityRules,
    currentEligibility,
  } = useEligibility();
  const { address } = useAccount();
  const { signAgreement } = useAgreementClaim({
    moduleDetails: activeModule,
    moduleParameters: activeModule?.liveParameters,
    chainId,
    onSuccessfulSign: () => {
      queryClient.invalidateQueries({ queryKey: ['wearerDetails'] });
      queryClient.invalidateQueries({ queryKey: ['currentEligibility'] });
      // TODO invalidate other queries
      if (!activeModule.instanceAddress) return;
      setIsReadyToClaim(activeModule.instanceAddress);
    },
  });

  const chainHasSubscription = some(flatten(eligibilityRules), (rule: EligibilityRule) =>
    rule.module.id.includes('public-lock-v14'),
  );

  const { data: wearerHats } = useWearerDetails({
    wearerAddress: address as Hex,
    chainId,
  });

  const activeModuleEligibility = activeModule.instanceAddress
    ? get(currentEligibility, activeModule.instanceAddress)
    : { isEligible: false, goodStanding: false };
  const isEligible = get(activeModuleEligibility, 'eligible') && get(activeModuleEligibility, 'goodStanding');

  const handleSignAgreement = () => {
    signAgreement();
  };

  const isWearing = useMemo(() => includes(map(wearerHats, 'id'), selectedHat?.id), [wearerHats, selectedHat?.id]);
  const hasSupply = useMemo(
    () => toNumber(selectedHat?.maxSupply) - toNumber(selectedHat?.currentSupply) > 0,
    [selectedHat],
  );

  let buttonTooltip = '';
  if (!address) {
    buttonTooltip = 'Connect your wallet to accept the agreement.';
  } else if (isWearing && isEligible) {
    buttonTooltip = 'You are wearing this hat.';
  } else if (!hasSupply) {
    buttonTooltip = 'No hats left to claim. If this hat is mutable an admin could increase the supply.';
  } else if (!isClaimableFor && selectedHat?.id !== CONFIG.agreementV0.communityHatId) {
    buttonTooltip = 'Please allow any account to claim this Hat on behalf of eligible users.';
  }

  const moduleAddress = activeModule?.instanceAddress;
  if (!moduleAddress) return null;

  const localClaimable = !isClaimableFor && selectedHat?.id !== CONFIG.agreementV0.communityHatId;
  const isReadyToClaim = !!get(aggregateReadyToClaim, moduleAddress) || isEligible;

  if (isReadyToClaim) {
    return (
      <div className='flex items-center gap-1'>
        <p className='text-functional-success'>Accepted</p>
        <BsCheckSquareFill className='text-functional-success h-4 w-4' />
      </div>
    );
  }

  return (
    <Tooltip label={buttonTooltip}>
      <Button
        variant='default'
        className='py-4'
        size='lg'
        onClick={() => {
          if (chainHasSubscription) {
            handleSignAgreement();
          } else {
            setIsReadyToClaim(moduleAddress);
          }
        }}
        disabled={localClaimable || !hasSupply || (isWearing && isEligible) || !address}
      >
        <BsCheckCircleFill className='mr-1 h-4 w-4' />
        Accept Agreement
      </Button>
    </Tooltip>
  );
};

interface AgreementClaimsProps {
  activeModule: ModuleDetails;
  labeledModules?: LabeledModules | undefined;
  showOnMobile?: boolean;
  variant?: 'default' | 'councils';
}

export const AgreementClaims = ({
  activeModule,
  labeledModules,
  showOnMobile = false,
  variant = 'default',
}: AgreementClaimsProps) => {
  const { selectedHatDetails, selectedHat, eligibilityRules } = useEligibility();

  const { agreement } = useAgreementClaim({
    moduleParameters: activeModule?.liveParameters,
  });

  const { data: agreementV0, isLoading: isLoadingV0 } = useQuery({
    queryKey: ['agreementV0'],
    queryFn: () => handleFetchIpfs(CONFIG.agreementV0.ipfsHash),
    enabled: !agreement,
  });

  let onlyHat = size(flatten(eligibilityRules)) === 1;
  if (selectedHat?.id === CONFIG.agreementV0.communityHatId) {
    onlyHat = true;
  }
  // console.log('agreement', agreement, activeModule);

  return (
    <div
      className={cn('w-full flex-col gap-4', {
        'hidden md:flex': !showOnMobile,
        'flex md:flex': showOnMobile,
      })}
    >
      <Card className='flex flex-col justify-between gap-6 border-[#2D3748] bg-white px-8 py-6'>
        <div className='flex justify-between'>
          <h3 className='text-2xl font-bold'>
            Sign the agreement
            {onlyHat ? ` to claim the ${get(selectedHatDetails, 'name')} ${capitalize(CONFIG.TERMS.hat)}` : ''}
          </h3>

          <div
            className={cn('flex min-w-[175px] justify-end', {
              'hidden md:flex': variant === 'councils',
            })}
          >
            <AgreementButton activeModule={activeModule} />
          </div>
        </div>

        <AgreementContent agreement={agreement || agreementV0 || undefined} isLoading={isLoadingV0 && !agreement} />
        <div className='flex'>
          <AgreementButton activeModule={activeModule} />
        </div>
      </Card>
    </div>
  );
};
