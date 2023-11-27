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

export type Authority = {
  label: string;
  link: string;
  gate?: string;
  description?: string;
  imageUrl?: string;
  type?: AuthorityType;
  id?: number;
};

export type AuthorityType = 'token' | 'manual';

export type FormDataDetails = {
  name: string;
  displayName?: string;
  description: string;
  guilds: string[];
  spaces: string[];
  responsibilities: DetailsItem[];
  authorities: Authority[];
  isEligibilityManual: string;
  isToggleManual: string;
  revocationsCriteria: DetailsItem[];
  deactivationsCriteria: DetailsItem[];
};

export type DeploymentType =
  | 'onlyModule'
  | 'moduleAndClaimsHatter'
  | 'onlyClaimsHatter';
