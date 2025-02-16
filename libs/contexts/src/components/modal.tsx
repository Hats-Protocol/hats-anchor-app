'use client';

import { get } from 'lodash';
import { ReactNode } from 'react';
import { cn, VisuallyHidden } from 'ui';

import { useOverlay } from '../overlay-context';
import {
  BaseModal,
  ModalBody,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from './base-modal';

// type ModalName = keyof Partial<ClaimsModals> | keyof Partial<AppModals>;

// TODO migrate modal to tailwind
/**
 * Modal component, wraps Shadcn's default Responsive Modal
 * @param name - name of modal `setModals?.({ modalName: true })`
 * @param title - title of modal used in header
 * @param content - content of modal
 * @param size - size of modal, defaults to `2xl`
 *   note include either `isOpen && onClose` or `localOverlay`
 * @param isOpen - whether modal is open, fallback to OverlayContext
 * @param onClose - function to close modal, fallback to OverlayContext
 * @returns Modal component and handlers
 */
const Modal = ({
  name,
  title,
  description,
  content,
  footer,
  customHeader,
  isOpen,
  onClose,
  size = '2xl',
  children,
}: ModalProps) => {
  const { modals, closeModals } = useOverlay();

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      closeModals?.();
    }
  };

  const classSizes = {
    '2xl': 'w-full max-w-[1200px]',
    xl: 'w-full max-w-[800px]',
    lg: 'w-full max-w-[600px]',
    md: 'w-full max-w-md',
    sm: 'w-full max-w-sm',
  };

  return (
    <BaseModal open={isOpen || get(modals, name) || false} onOpenChange={handleClose}>
      <ModalContent
        className={cn(
          'min-w-20vw rounded-b-0 mb-0 mt-auto flex flex-col bg-white px-4 py-6 md:mb-auto md:mt-4 md:rounded-2xl md:px-10 md:py-0',
          classSizes[size as keyof typeof classSizes],
        )}
      >
        {customHeader
          ? customHeader
          : title && (
              <ModalHeader className='py-4'>
                <ModalTitle className='text-2xl font-bold'>{title}</ModalTitle>
              </ModalHeader>
            )}
        <VisuallyHidden>
          <ModalDescription>{description || title}</ModalDescription>
        </VisuallyHidden>

        <ModalBody>{content || children}</ModalBody>

        {footer && <ModalFooter>{footer}</ModalFooter>}
      </ModalContent>
    </BaseModal>
  );
};

interface ModalProps {
  name: string;
  title?: string;
  description?: string;
  content?: string;
  footer?: ReactNode;
  customHeader?: ReactNode;
  isOpen?: boolean;
  onClose?: () => void;
  size?: string | object;
  children: ReactNode;
}

export { Modal, type ModalProps };
