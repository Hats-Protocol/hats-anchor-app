'use client';

import { useOverlay } from 'contexts';
import { filter, get, includes, map, toLower } from 'lodash';
import { useAllowlist } from 'modules-hooks';
import posthog from 'posthog-js';
import { BsCheckSquareFill, BsFillXOctagonFill } from 'react-icons/bs';
import { SupportedChains } from 'types';
import { Button } from 'ui';
import { ModuleDetailsHandler } from 'utils';

import { ELIGIBILITY_STATUS, EligibilityRuleDetails } from '../eligibility-rules';
import { AllowlistModal } from './allowlist-modal';

const IS_CLAIMS_APP = process.env.NEXT_PUBLIC_CLAIMS_APP === 'true';
const IS_PRO_APP = process.env.NEXT_PUBLIC_PRO_APP === 'true';

export const AllowlistEligibilityRule = ({
  chainId,
  wearer,
  selectedHat,
  moduleDetails,
  moduleParameters,
  wearerEligibility,
}: ModuleDetailsHandler) => {
  const { setModals } = useOverlay();

  const { data: allowlist } = useAllowlist({
    id: moduleDetails?.instanceAddress,
    chainId: chainId as SupportedChains,
  });
  const isIncludedInAllowlist = includes(
    map(
      filter(allowlist, (a) => a.eligible && !a.badStanding),
      'address',
    ),
    toLower(wearer),
  );

  const moduleEligibility = moduleDetails?.instanceAddress && get(wearerEligibility, moduleDetails.instanceAddress);
  const isEligible = (moduleEligibility?.eligible && moduleEligibility?.goodStanding) || isIncludedInAllowlist;

  const eligibilityModalFlag = posthog.isFeatureEnabled('eligibility-modal') || process.env.NODE_ENV === 'development';

  if (!selectedHat || !moduleDetails?.instanceAddress) return null;

  if (isEligible) {
    return (
      <>
        <AllowlistModal eligibilityHatId={selectedHat?.id} moduleInfo={moduleDetails} />

        <EligibilityRuleDetails
          rule={
            <div>
              Be on the{' '}
              {eligibilityModalFlag && !IS_CLAIMS_APP && !IS_PRO_APP ? (
                <Button
                  onClick={() =>
                    setModals?.({
                      [`${moduleDetails.instanceAddress}-allowlistManager`]: true,
                    })
                  }
                  variant='link'
                  className='text-base'
                >
                  Allowlist
                </Button>
              ) : (
                'Allowlist'
              )}
            </div>
          }
          status={ELIGIBILITY_STATUS.eligible}
          displayStatus='Allowed'
          icon={BsCheckSquareFill}
        />
      </>
    );
  }

  return (
    <>
      <AllowlistModal
        eligibilityHatId={selectedHat?.id}
        moduleInfo={{
          ...moduleDetails,
          liveParameters: moduleParameters,
        }}
      />

      <EligibilityRuleDetails
        rule={
          <p>
            Be on the{' '}
            {eligibilityModalFlag && !IS_CLAIMS_APP && !IS_PRO_APP ? (
              <Button
                onClick={() =>
                  setModals?.({
                    [`${moduleDetails.instanceAddress}-allowlistManager`]: true,
                  })
                }
                variant='link'
                className='text-base underline'
              >
                Allowlist
              </Button>
            ) : (
              'Allowlist'
            )}
          </p>
        }
        status={ELIGIBILITY_STATUS.ineligible}
        displayStatus='Not allowed'
        icon={BsFillXOctagonFill} // {EmptyWearer}
      />
    </>
  );
};
