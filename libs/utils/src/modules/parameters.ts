import { ModuleParameter } from '@hatsprotocol/modules-sdk';
import { hatIdDecimalToHex } from '@hatsprotocol/sdk-v1-core';
import { find, get, toString } from 'lodash';
import { JokeRaceEligibility } from 'types';
import { Hex } from 'viem';

export const getJokeRaceModuleParameters = ({
  moduleParameters,
  jokeRaceDetails,
}: {
  moduleParameters: ModuleParameter[] | undefined;
  jokeRaceDetails: JokeRaceEligibility | undefined;
}) => ({
  contestAddress: get(
    jokeRaceDetails,
    'currentTerm.contest',
    get(find(moduleParameters, { displayType: 'jokerace' }), 'value'),
  ) as Hex,
  topK:
    get(
      jokeRaceDetails,
      'currentTerm.topK',
      toString(
        get(
          find(moduleParameters, { label: 'Number Of Elected Hat Wearers' }),
          'value',
        ),
      ),
    ) || 'X',
  termEnd: get(
    jokeRaceDetails,
    'currentTerm.termEndsAt',
    get(find(moduleParameters, { label: 'Term End' }), 'value'),
  ) as Hex,
  adminHat: hatIdDecimalToHex(
    get(find(moduleParameters, { displayType: 'hat' }), 'value') as bigint,
  ) as Hex,
});
