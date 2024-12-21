'use client';

import { Button, Icon } from '@chakra-ui/react';
import { KNOWN_ELIGIBILITY_MODULES } from '@hatsprotocol/constants';
import { useOverlay } from 'contexts';
import { includes } from 'lodash';
import {
  AgreementModal,
  AllowlistModal,
  ElectionModal,
  JokeRaceModal,
  StakingModal,
} from 'modules-ui';
import { BsPencil } from 'react-icons/bs';
import { Authority } from 'types';

const CustomFunction = ({
  authority,
}: {
  authority: Authority | undefined;
}) => {
  const { setModals } = useOverlay();
  if (!authority || !authority.moduleInfo) return null;

  if (includes(KNOWN_ELIGIBILITY_MODULES.agreement, authority.moduleAddress)) {
    return (
      <>
        <Button
          leftIcon={<Icon as={BsPencil} />}
          size='sm'
          variant='primary'
          onClick={() =>
            setModals?.({
              [`${authority.moduleInfo?.id}-agreementManager`]: true,
            })
          }
        >
          View Signers
        </Button>

        <AgreementModal
          eligibilityHatId={authority.hatId}
          moduleInfo={authority.moduleInfo}
        />
      </>
    );
  }

  if (includes(KNOWN_ELIGIBILITY_MODULES.allowlist, authority.moduleAddress)) {
    // TODO only show "Edit" if current user is associated role
    return (
      <>
        <Button
          leftIcon={<Icon as={BsPencil} />}
          size='sm'
          variant='primary'
          onClick={() =>
            setModals?.({
              [`${authority.moduleInfo?.id}-allowlistManager`]: true,
            })
          }
        >
          Edit Allowlist
        </Button>

        <AllowlistModal
          eligibilityHatId={authority.hatId}
          moduleInfo={authority.moduleInfo}
        />
      </>
    );
  }

  if (includes(KNOWN_ELIGIBILITY_MODULES.election, authority.moduleAddress)) {
    return (
      <>
        <Button
          leftIcon={<Icon as={BsPencil} />}
          size='sm'
          variant='primary'
          onClick={() => setModals?.({ electionManager: true })}
        >
          View Electees
        </Button>

        <ElectionModal
          eligibilityHatId={authority.hatId}
          moduleInfo={authority.moduleInfo}
        />
      </>
    );
  }

  if (includes(KNOWN_ELIGIBILITY_MODULES.jokeRace, authority.moduleAddress)) {
    return (
      <>
        <Button
          leftIcon={<Icon as={BsPencil} />}
          size='sm'
          variant='primary'
          onClick={() =>
            setModals?.({
              [`${authority.moduleInfo?.id}-jokeRaceManager`]: true,
            })
          }
        >
          View Electees
        </Button>

        <JokeRaceModal
          eligibilityHatId={authority.hatId}
          moduleInfo={authority.moduleInfo}
        />
      </>
    );
  }

  if (includes(KNOWN_ELIGIBILITY_MODULES.staking, authority.moduleAddress)) {
    return (
      <>
        <Button
          leftIcon={<Icon as={BsPencil} />}
          size='sm'
          variant='primary'
          onClick={() => setModals?.({ stakingManager: true })}
        >
          View Stakers
        </Button>

        <StakingModal
          eligibilityHatId={authority.hatId}
          moduleInfo={authority.moduleInfo}
        />
      </>
    );
  }

  return <div>CustomFunction</div>;
};

export default CustomFunction;
