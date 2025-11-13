'use client';

import { useOverlay } from 'contexts';
import { filter, get, includes, map, toLower } from 'lodash';
import { useAllowlist } from 'modules-hooks';
import { BsCheckSquareFill, BsFillXOctagonFill } from 'react-icons/bs';
import { AppModals, ModuleDetails, SupportedChains } from 'types';
import { Button } from 'ui';
import { ModuleDetailsHandler } from 'utils';

import { ELIGIBILITY_STATUS, EligibilityRuleDetails } from '../eligibility-rules';
import { AllowlistManagerModal, AllowlistModal } from './allowlist-modal';

const IS_CLAIMS_APP = process.env.NEXT_PUBLIC_CLAIMS_APP === 'true';
const IS_PRO_APP = process.env.NEXT_PUBLIC_PRO_APP === 'true';

const AllowlistButton = ({
  eligibilityModalFlag,
  moduleDetails,
  setModals,
}: {
  eligibilityModalFlag: boolean;
  moduleDetails: ModuleDetails;
  setModals: ((modals: Partial<AppModals>) => void) | undefined;
}) => {
  // anchor with flag on
  if (!IS_CLAIMS_APP && !IS_PRO_APP && eligibilityModalFlag) {
    return (
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
    );
  }

  // claims app or pro app
  if (IS_CLAIMS_APP || IS_PRO_APP) {
    return (
      <Button
        onClick={() =>
          setModals?.({
            [`${moduleDetails.instanceAddress}-allowlist`]: true,
          })
        }
        variant='link'
        className='text-base underline'
      >
        Allowlist
      </Button>
    );
  }

  return 'Allowlist';
};

export const AllowlistEligibilityRule = ({
  chainId,
  wearer,
  selectedHat,
  moduleDetails,
  moduleParameters,
  wearerEligibility,
}: ModuleDetailsHandler) => {
  const { modals, setModals } = useOverlay();

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

  const eligibilityModalFlag = false || process.env.NODE_ENV === 'development';

  if (!selectedHat || !moduleDetails?.instanceAddress) return null;

  if (isEligible) {
    return (
      <>
        <AllowlistManagerModal eligibilityHatId={selectedHat?.id} moduleInfo={moduleDetails} />

        <AllowlistModal
          eligibilityHatId={selectedHat?.id}
          moduleInfo={moduleDetails}
          chainId={chainId as SupportedChains}
        />

        <EligibilityRuleDetails
          rule={
            <div>
              Be on the{' '}
              <AllowlistButton
                eligibilityModalFlag={eligibilityModalFlag}
                moduleDetails={moduleDetails}
                setModals={setModals}
              />
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
      <AllowlistManagerModal
        eligibilityHatId={selectedHat?.id}
        moduleInfo={{
          ...moduleDetails,
          liveParameters: moduleParameters,
        }}
      />
      <AllowlistModal
        eligibilityHatId={selectedHat?.id}
        moduleInfo={{ ...moduleDetails, liveParameters: moduleParameters }}
        chainId={chainId as SupportedChains}
      />

      <EligibilityRuleDetails
        rule={
          <p>
            Be on the{' '}
            <AllowlistButton
              eligibilityModalFlag={eligibilityModalFlag}
              moduleDetails={moduleDetails}
              setModals={setModals}
            />
          </p>
        }
        status={ELIGIBILITY_STATUS.ineligible}
        displayStatus='Not allowed'
        icon={BsFillXOctagonFill} // {EmptyWearer}
      />
    </>
  );
};
