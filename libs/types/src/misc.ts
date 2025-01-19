import type { ComponentWithAs, IconProps } from '@chakra-ui/react';
import type { ReactNode } from 'react';
import type { IconName } from 'react-cmdk';
import type { IconType } from 'react-icons';
import type { Hex } from 'viem';

import { HatDetails } from './hat';

export type ValueOf<T> = T[keyof T];

export type MixedIcon = IconType | ComponentWithAs<'svg', IconProps>;

export type ImageFile = {
  path: string;
  preview?: string;
  lastModified?: number;
  lastModifiedDate?: Date;
  name?: string;
  size?: number;
  type?: string;
  webkitRelativePath?: string;
};

export type DocsLink = {
  url: string;
  icon?: any;
  image?: string;
  name: string;
  description: string;
};

export type Hierarchy = {
  id: string;
  parentId?: Hex;
  firstChild?: Hex;
  leftSibling?: Hex;
  rightSibling?: Hex;
  leftSiblings?: Hex[];
  rightSiblings?: Hex[];
};

export interface LinkObject {
  link: string;
  label: string;
  icon?: IconType;
}

export type InputObject = {
  id: Hex;
  parentId: Hex | undefined;
};

export interface Controls {
  label: string;
  value: string;
  icon: ReactNode;
}

export type SearchResults = {
  children: string;
  href: string;
  icon: IconName;
  id: string;
};

export type Transaction = {
  hash: string;
  txChainId?: number;
  txDescription: string;
  status: string;
  timestamp: number;
};

export interface Group {
  id: string;
  heading: string;
  items: Array<{
    id: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
  }>;
}

export type SearchParamsProps = {
  searchParams: { [key: string]: string | string[] | undefined };
};

export interface HatPinDetails {
  chainId: number;
  localChainId?: number;
  hatId: Hex;
  details: HatDetails;
}
