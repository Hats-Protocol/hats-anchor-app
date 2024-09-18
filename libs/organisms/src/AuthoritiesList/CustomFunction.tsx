import { Button, Icon } from '@chakra-ui/react';
import { KNOWN_ELIGIBILITY_MODULES } from '@hatsprotocol/constants';
import { useOverlay } from 'contexts';
import { includes } from 'lodash';
import { BsPencil } from 'react-icons/bs';

import AllowlistModal from './AllowlistModal';

const CustomFunction = ({
  authority,
}: {
  authority: any; // CustomFunction;
}) => {
  const { setModals } = useOverlay();
  if (!authority) return null;

  if (includes(KNOWN_ELIGIBILITY_MODULES.agreement, authority.moduleAddress)) {
    return <div>AgreementModal</div>;
  }

  if (includes(KNOWN_ELIGIBILITY_MODULES.allowlist, authority.moduleAddress)) {
    return (
      <>
        <Button
          leftIcon={<Icon as={BsPencil} />}
          size='sm'
          variant='primary'
          onClick={() => setModals?.({ allowlistManager: true })}
        >
          Edit Allowlist
        </Button>
        <AllowlistModal authority={authority} />
      </>
    );
  }

  if (includes(KNOWN_ELIGIBILITY_MODULES.election, authority.moduleAddress)) {
    return <div>ElectionModal</div>;
  }

  if (includes(KNOWN_ELIGIBILITY_MODULES.jokeRace, authority.moduleAddress)) {
    return <div>JokeRaceModal</div>;
  }

  if (includes(KNOWN_ELIGIBILITY_MODULES.staking, authority.moduleAddress)) {
    return <div>StakingModal</div>;
  }

  return <div>CustomFunction</div>;
};

export default CustomFunction;
