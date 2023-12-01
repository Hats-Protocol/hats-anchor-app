import { Hex } from 'viem';

import { SnapshotStrategy } from '@/hooks/useSnapshotSpaces';

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

export type AuthorityType =
  | 'protocol'
  | 'modules'
  | 'wallet'
  | 'hsg'
  | 'onchain'
  | 'gate'
  | 'manual';

export type Authority = {
  label: string;
  link: string;
  gate?: string | undefined;
  description?: string;
  imageUrl?: string;
  type?: string | AuthorityType | undefined;
  id?: string | number;
  strategies?: SnapshotStrategy[];
};

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
