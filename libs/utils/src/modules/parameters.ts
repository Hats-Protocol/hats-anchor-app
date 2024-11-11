import { ModuleParameter } from '@hatsprotocol/modules-sdk';
import { hatIdDecimalToHex } from '@hatsprotocol/sdk-v1-core';
import { find, get, toString } from 'lodash';
import { JokeRaceTerm } from 'types';
import { Hex } from 'viem';

export const getJokeRaceModuleParameters = ({
  moduleParameters,
  currentTerm,
}: {
  moduleParameters: ModuleParameter[] | undefined;
  currentTerm: JokeRaceTerm | undefined;
}) => ({
  contestAddress: get(
    currentTerm,
    'contest',
    get(find(moduleParameters, { displayType: 'jokerace' }), 'value'),
  ) as Hex,
  topK:
    get(
      currentTerm,
      'topK',
      toString(
        get(
          find(moduleParameters, { label: 'Number Of Elected Hat Wearers' }),
          'value',
        ),
      ),
    ) || 'X',
  termEnd: get(
    currentTerm,
    'termEndsAt',
    get(find(moduleParameters, { label: 'Term End' }), 'value'),
  ) as Hex,
  transitionPeriod: get(
    currentTerm,
    'transitionPeriod',
    get(find(moduleParameters, { label: 'Transition Period' }), 'value', '0'),
  ) as string,
  adminHat: hatIdDecimalToHex(
    get(find(moduleParameters, { displayType: 'hat' }), 'value') as bigint,
  ) as Hex,
});
