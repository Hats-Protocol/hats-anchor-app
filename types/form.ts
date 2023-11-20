import { Hex } from 'viem';

import { DetailsItem } from './hat';

export type FormFieldKeys = Exclude<
  keyof FormData,
  'id' | 'parentId' | 'adminId'
>;
export type FieldItem = { name: FormFieldKeys; label: string };

export interface FormWearer {
  address: Hex;
  ens: string;
}

export type FormData = FormDataDetails & {
  maxSupply?: string;
  eligibility?: Hex;
  toggle?: Hex;
  mutable: string;
  imageUrl?: string;
  id: Hex;
  wearers: FormWearer[];
  parentId?: Hex;
  adminId?: Hex;
};

export type FormDataDetails = {
  name: string;
  displayName?: string;
  description: string;
  guilds: string[];
  responsibilities: DetailsItem[];
  authorities: DetailsItem[];
  isEligibilityManual: string;
  isToggleManual: string;
  revocationsCriteria: DetailsItem[];
  deactivationsCriteria: DetailsItem[];
};

export type DeploymentType =
  | 'onlyModule'
  | 'moduleAndClaimsHatter'
  | 'onlyClaimsHatter';
