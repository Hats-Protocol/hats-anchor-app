import { As } from '@chakra-ui/react';
import { ReactNode } from 'react';
import { IconName } from 'react-cmdk';
import { IconType } from 'react-icons';
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

export type DocsLink = {
  url: string;
  icon?: As;
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
