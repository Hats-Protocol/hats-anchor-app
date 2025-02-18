'use client';

import { KNOWN_ELIGIBILITY_MODULES } from '@hatsprotocol/constants';
import { useOverlay } from 'contexts';
import { includes } from 'lodash';
import { AgreementModal, AllowlistModal, ElectionModal, JokeRaceModal, StakingModal } from 'modules-ui';
import { BsPencil } from 'react-icons/bs';
import { Authority } from 'types';
import { Button } from 'ui';

const CustomFunction = ({ authority }: { authority: Authority | undefined }) => {
  const { setModals } = useOverlay();
  if (!authority || !authority.moduleInfo) return null;

  if (includes(KNOWN_ELIGIBILITY_MODULES.agreement, authority.moduleAddress)) {
    return (
      <>
        <Button
          size='sm'
          onClick={() =>
            setModals?.({
              [`${authority.moduleInfo?.id}-agreementManager`]: true,
            })
          }
        >
          <BsPencil className='mr-2' />
          View Signers
        </Button>

        <AgreementModal eligibilityHatId={authority.hatId} moduleInfo={authority.moduleInfo} />
      </>
    );
  }

  if (includes(KNOWN_ELIGIBILITY_MODULES.allowlist, authority.moduleAddress)) {
    // TODO only show "Edit" if current user is associated role
    return (
      <>
        <Button
          size='sm'
          onClick={() =>
            setModals?.({
              [`${authority.moduleInfo?.id}-allowlistManager`]: true,
            })
          }
        >
          <BsPencil className='mr-2' />
          Edit Allowlist
        </Button>

        <AllowlistModal eligibilityHatId={authority.hatId} moduleInfo={authority.moduleInfo} />
      </>
    );
  }

  if (includes(KNOWN_ELIGIBILITY_MODULES.election, authority.moduleAddress)) {
    return (
      <>
        <Button size='sm' onClick={() => setModals?.({ electionManager: true })}>
          <BsPencil className='mr-2' />
          View Electees
        </Button>

        <ElectionModal eligibilityHatId={authority.hatId} moduleInfo={authority.moduleInfo} />
      </>
    );
  }

  if (includes(KNOWN_ELIGIBILITY_MODULES.jokeRace, authority.moduleAddress)) {
    return (
      <>
        <Button
          size='sm'
          onClick={() =>
            setModals?.({
              [`${authority.moduleInfo?.id}-jokeRaceManager`]: true,
            })
          }
        >
          <BsPencil className='mr-2' />
          View Electees
        </Button>

        <JokeRaceModal eligibilityHatId={authority.hatId} moduleInfo={authority.moduleInfo} />
      </>
    );
  }

  if (includes(KNOWN_ELIGIBILITY_MODULES.staking, authority.moduleAddress)) {
    return (
      <>
        <Button size='sm' onClick={() => setModals?.({ stakingManager: true })}>
          <BsPencil className='mr-2' />
          View Stakers
        </Button>

        <StakingModal eligibilityHatId={authority.hatId} moduleInfo={authority.moduleInfo} />
      </>
    );
  }

  return <div>CustomFunction</div>;
};

export { CustomFunction };
