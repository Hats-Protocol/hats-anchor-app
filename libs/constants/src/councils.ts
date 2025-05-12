import { DeployStatus, EligibilityRequirements } from 'types';

export const MULTICALL3_ADDRESS = '0xcA11bde05977b3631167028862bE2a173976CA11' as const;

export const HSG_V2_ADDRESS = '0x148057884AC910Bdd93693F230C5c35a8c47CA3b' as const;

export const ZODIAC_MODULE_PROXY_FACTORY_ADDRESS = '0x000000000000aDdB49795b0f9bA5BC298cDda236' as const;

export const ALLOWLIST_ELIGIBILITY_ADDRESS = '0x80336fb7b6B653686eBe71d2c3ee685b70108B8f' as const;

export const AGREEMENT_ELIGIBILITY_ADDRESS = '0x4F10B9e99ce11f081652646f4b192ed1b812D5Bb' as const;

export const ELIGIBILITY_CHAIN_ADDRESS = '0x8AdED513a191e3FeE91Bb192Aba20FcC9c16aF2e' as const;

export const ERC20_ELIGIBILITY_ADDRESS = '0xba5b218e6685d0607139c06f81442681a32a0ec3' as const;

const successStatusSteps = {
  processTx: false,
  updateMetadata: false,
  redirect: false,
};

export const initialDeployStatus: DeployStatus = {
  prepareTx: false,
  deployTx: false,
  confirmTx: false,
  indexTx: false,
  ...successStatusSteps,
};

export const initialDeployMultiStatus: DeployStatus = {
  prepareTx: false,
  deployHatsTx: false,
  confirmHatsTx: false,
  indexHatsTx: false,
  deployModulesTx: false,
  confirmModulesTx: false,
  indexModulesTx: false,
  deployHsgTx: false,
  confirmHsgTx: false,
  indexHsgTx: false,
  ...successStatusSteps,
};

export const defaultEligibilityRequirements: EligibilityRequirements = {
  selection: {
    required: true, // we're always setting selection allowlist
    existingId: null,
    existingAdmins: 'org-managers',
    set: false, // handled via members-step
    adminsSet: false, // handled via admins/management-step
  },
  compliance: {
    required: false,
    existingId: null,
    existingAdmins: null,
    set: true, // we're not handling members on allowlist for compliance right now
    adminsSet: false,
  },
  agreement: {
    required: false,
    existingId: null,
    existingAdmins: null,
    content: null,
    set: false,
    adminsSet: false,
  },
  erc20: {
    required: false,
    existingId: null,
    existingAdmins: null,
    address: null,
    amount: null,
    set: true, // not optional, fields must be filled
    adminsSet: true, // no admin role for erc20
  },
};
