import { ReactNode } from 'react';
import { IconName } from 'react-cmdk';
import { Hex } from 'viem';

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

export type Hierarchy = {
  id: string;
  parentId?: Hex;
  firstChild?: Hex;
  leftSibling?: Hex;
  rightSibling?: Hex;
  leftSiblings?: Hex[];
  rightSiblings?: Hex[];
};

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
  fnName: string;
  status: string;
  timestamp: number;
};

export interface Group {
  id: string;
  heading: string;
  items: Array<{
    id: string;
    [key: string]: any;
  }>;
}
