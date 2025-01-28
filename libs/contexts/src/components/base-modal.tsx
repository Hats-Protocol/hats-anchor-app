'use client';

import { useMediaQuery } from 'hooks';
import * as React from 'react';
import {
  cn,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from 'ui';

// Responsive Modal component

interface BaseProps {
  children: React.ReactNode;
}

interface RootModalProps extends BaseProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

interface ModalProps extends BaseProps {
  className?: string;
  asChild?: true;
}

const ModalContext = React.createContext<{ isDesktop: boolean }>({
  isDesktop: false,
});

const useModalContext = () => {
  const context = React.useContext(ModalContext);
  if (!context) {
    throw new Error('Modal components cannot be rendered outside the Modal Context');
  }
  return context;
};

const Modal = ({ children, ...props }: RootModalProps) => {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const Modal = isDesktop ? Dialog : Drawer;

  return (
    <ModalContext.Provider value={{ isDesktop }}>
      <Modal {...props} {...(!isDesktop && { autoFocus: true })}>
        {children}
      </Modal>
    </ModalContext.Provider>
  );
};

const ModalTrigger = ({ className, children, ...props }: ModalProps) => {
  const { isDesktop } = useModalContext();
  const ModalTrigger = isDesktop ? DialogTrigger : DrawerTrigger;

  return (
    <ModalTrigger className={className} {...props}>
      {children}
    </ModalTrigger>
  );
};

const ModalClose = ({ className, children, ...props }: ModalProps) => {
  const { isDesktop } = useModalContext();
  const ModalClose = isDesktop ? DialogClose : DrawerClose;

  return (
    <ModalClose className={className} {...props}>
      {children}
    </ModalClose>
  );
};

const ModalContent = ({ className, children, ...props }: ModalProps) => {
  const { isDesktop } = useModalContext();
  const ModalContent = isDesktop ? DialogContent : DrawerContent;

  return (
    <ModalContent className={className} {...props}>
      {children}
    </ModalContent>
  );
};

const ModalDescription = ({ className, children, ...props }: ModalProps) => {
  const { isDesktop } = useModalContext();
  const ModalDescription = isDesktop ? DialogDescription : DrawerDescription;

  return (
    <ModalDescription className={className} {...props}>
      {children}
    </ModalDescription>
  );
};

const ModalHeader = ({ className, children, ...props }: ModalProps) => {
  const { isDesktop } = useModalContext();
  const ModalHeader = isDesktop ? DialogHeader : DrawerHeader;

  return (
    <ModalHeader className={className} {...props}>
      {children}
    </ModalHeader>
  );
};

const ModalTitle = ({ className, children, ...props }: ModalProps) => {
  const { isDesktop } = useModalContext();
  const ModalTitle = isDesktop ? DialogTitle : DrawerTitle;

  return (
    <ModalTitle className={className} {...props}>
      {children}
    </ModalTitle>
  );
};

const ModalBody = ({ className, children, ...props }: ModalProps) => {
  return (
    <div className={cn('px-4 md:px-0', className)} {...props}>
      {children}
    </div>
  );
};

const ModalFooter = ({ className, children, ...props }: ModalProps) => {
  const { isDesktop } = useModalContext();
  const ModalFooter = isDesktop ? DialogFooter : DrawerFooter;

  return (
    <ModalFooter className={className} {...props}>
      {children}
    </ModalFooter>
  );
};

export {
  Modal as BaseModal,
  ModalBody,
  ModalClose as ModalCloseButton,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  ModalTrigger,
};
