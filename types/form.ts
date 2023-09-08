import { Hex } from 'viem';

import { DetailsItem } from './hat';

export type FieldItem = { name: keyof FormData; label: string };

export type FormData = FormDataDetails & {
  maxSupply?: string;
  eligibility?: Hex;
  toggle?: Hex;
  mutable: string;
  imageUrl?: string;
  id: Hex;
  wearers: Hex[];
  parentId?: Hex;
};

export type FormDataDetails = {
  name: string;
  description: string;
  guilds: string[];
  responsibilities: DetailsItem[];
  authorities: DetailsItem[];
  isEligibilityManual: string;
  isToggleManual: string;
  revocationsCriteria: DetailsItem[];
  deactivationsCriteria: DetailsItem[];
  newImageUri?: string;
};

export type DirtyFormData = {
  imageUrl?: string;
  [key: string]: string | string[] | DetailsItem[] | undefined;
};
