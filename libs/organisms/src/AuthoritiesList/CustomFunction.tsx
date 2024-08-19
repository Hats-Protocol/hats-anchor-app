import { KNOWN_ELIGIBILITY_MODULES } from '@hatsprotocol/constants';
import { includes } from 'lodash';

const CustomFunction = ({
  customFunction,
}: {
  customFunction: any; // CustomFunction;
}) => {
  if (!customFunction) return null;

  if (
    includes(KNOWN_ELIGIBILITY_MODULES.agreement, customFunction.moduleAddress)
  ) {
    return <div>AgreementModal</div>;
  }

  if (
    includes(KNOWN_ELIGIBILITY_MODULES.allowlist, customFunction.moduleAddress)
  ) {
    return <div>AllowlistModal</div>;
  }

  if (
    includes(KNOWN_ELIGIBILITY_MODULES.election, customFunction.moduleAddress)
  ) {
    return <div>ElectionModal</div>;
  }

  if (
    includes(KNOWN_ELIGIBILITY_MODULES.jokeRace, customFunction.moduleAddress)
  ) {
    return <div>JokeRaceModal</div>;
  }

  if (
    includes(KNOWN_ELIGIBILITY_MODULES.staking, customFunction.moduleAddress)
  ) {
    return <div>StakingModal</div>;
  }

  return <div>CustomFunction</div>;
};

export default CustomFunction;
