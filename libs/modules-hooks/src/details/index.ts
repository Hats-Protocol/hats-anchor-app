import { ModuleDetailsComponent } from 'types';
import { Hex } from 'viem';

import { AllowlistEligibilityDetails } from './allowlist';

export const MODULE_DETAILS: { [key: Hex]: ModuleDetailsComponent } = {
  '0xac208e6668de569c6ea1db76decea70430335ed5': AllowlistEligibilityDetails,
};
