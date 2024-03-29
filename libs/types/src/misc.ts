import { As, CreateToastFnReturn } from '@chakra-ui/react';
import { ReactNode } from 'react';
import { IconName } from 'react-cmdk';
import { IconType } from 'react-icons';
import { Hex } from 'viem';

export type ValueOf<T> = T[keyof T];

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

export interface ToastBaseProps {
  toast: CreateToastFnReturn;
  title: string;
  description?: string;
  iconName?: string;
  status: 'success' | 'error' | 'warning' | 'loading' | 'info';
  id?: string;
  duration?: number;
  closeToast: () => void;
  isClosable?: boolean;
}

export interface ToastProps {
  title: string;
  description?: string;
  // icon: React.ReactNode;
  status?: 'success' | 'error' | 'warning' | 'loading' | 'info';
  closeToast?: () => void;
  duration?: number;
  isClosable?: boolean;
}

export interface UseCustomToastReturn {
  success: (props: ToastProps) => void;
  error: (props: ToastProps) => void;
  warning: (props: ToastProps) => void;
  loading: (props: ToastProps) => void;
  info: (props: ToastProps) => void;
}
