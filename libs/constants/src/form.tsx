import { DeploymentType, FieldItem } from 'hats-types';
import { Hex } from 'viem';

import { FALLBACK_ADDRESS } from './misc';

export type ModuleTypes = { [key: string]: string };

export const MODULE_TYPES = {
  eligibility: 'ELIGIBILITY',
  toggle: 'TOGGLE',
};

export const DEPLOYMENT_TYPES: { [key: string]: DeploymentType } = {
  ONLY_MODULE: 'onlyModule',
  MODULE_AND_CLAIMS_HATTER: 'moduleAndClaimsHatter',
  ONLY_CLAIMS_HATTER: 'onlyClaimsHatter',
};

export const STATUS = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
};

export const MUTABILITY = {
  MUTABLE: 'Mutable',
  IMMUTABLE: 'Immutable',
};

export const TRIGGER_OPTIONS = {
  MANUALLY: 'Manually',
  AUTOMATICALLY: 'Automatically',
};

const hatBasicsFields: FieldItem[] = [
  { name: 'name', label: 'Name' },
  { name: 'description', label: 'Description' },
  { name: 'imageUrl', label: 'Image' },
  { name: 'guilds', label: 'Guilds' },
  { name: 'spaces', label: 'Spaces' },
  { name: 'mutable', label: 'Editable' },
];

const wearerFields: FieldItem[] = [
  { name: 'maxSupply', label: 'Max Supply' },
  { name: 'wearers', label: 'Wearers' },
];

const powersFields: FieldItem[] = [
  { name: 'authorities', label: 'Authorities' },
];

const responsibilitiesFields: FieldItem[] = [
  { name: 'responsibilities', label: 'Responsibilities' },
];

const revocationFields: FieldItem[] = [
  { name: 'isEligibilityManual', label: 'Eligibility Type' },
  { name: 'eligibility', label: 'Eligibility' },
  { name: 'revocationsCriteria', label: 'Revocation Criteria' },
];

const deactivationFields: FieldItem[] = [
  { name: 'isToggleManual', label: 'Toggle Type' },
  { name: 'toggle', label: 'Toggle' },
  { name: 'deactivationsCriteria', label: 'Deactivation Criteria' },
];

export const FORM_FIELDS = {
  basics: hatBasicsFields,
  wearer: wearerFields,
  powers: powersFields,
  responsibilities: responsibilitiesFields,
  revocation: revocationFields,
  deactivation: deactivationFields,
};

export const EMPTY_FORM_VALUES = {
  id: '0x' as Hex,
  maxSupply: '1',
  eligibility: FALLBACK_ADDRESS,
  toggle: FALLBACK_ADDRESS,
  mutable: MUTABILITY.MUTABLE,
  imageUrl: '',
  isEligibilityManual: TRIGGER_OPTIONS.MANUALLY,
  isToggleManual: TRIGGER_OPTIONS.MANUALLY,
  revocationsCriteria: [],
  deactivationsCriteria: [],
  name: '',
  description: '',
  authorities: [],
  responsibilities: [],
  guilds: [],
  spaces: [],
  wearers: [],
};
