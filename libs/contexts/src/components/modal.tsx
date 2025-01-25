'use client';

import { get } from 'lodash';
import { ReactNode } from 'react';
import { BsX } from 'react-icons/bs';

import { useOverlay } from '../overlay-context';
import { BaseModal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader } from './base-modal';

// type ModalName = keyof Partial<ClaimsModals> | keyof Partial<AppModals>;

// TODO migrate modal to tailwind
/**
 * Modal component, wraps Chakra's default Modal
 * @param name - name of modal `setModals?.({ modalName: true })`
 * @param title - title of modal used in header
 * @param content - content of modal
 * @param size - size of modal, defaults to `2xl`
 *   note include either `isOpen && onClose` or `localOverlay`
 * @param isOpen - whether modal is open, fallback to OverlayContext
 * @param onClose - function to close modal, fallback to OverlayContext
 * @returns Modal component and handlers
 */
const Modal = ({ name, title, content, footer, customHeader, isOpen, onClose, size = '2xl', children }: ModalProps) => {
  const { modals, closeModals } = useOverlay();

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      closeModals?.();
    }
  };

  return (
    <BaseModal open={isOpen || get(modals, name) || false} onOpenChange={handleClose}>
      <ModalContent className='min-w-20vw rounded-b-0 mb-0 mt-auto flex flex-col bg-gray-800 p-4 md:mb-auto md:mt-4 md:rounded-b-md'>
        {customHeader || (
          <ModalHeader>
            <h2 className='text-2xl font-bold'>{title}</h2>
          </ModalHeader>
        )}

        <ModalCloseButton>
          <BsX className='h-4 w-4' />
        </ModalCloseButton>

        <ModalBody>{content || children}</ModalBody>

        {footer && <ModalFooter>{footer}</ModalFooter>}
      </ModalContent>
    </BaseModal>
  );
};

interface ModalProps {
  name: string;
  title?: string;
  content?: string;
  footer?: ReactNode;
  customHeader?: ReactNode;
  isOpen?: boolean;
  onClose?: () => void;
  size?: string | object;
  children: ReactNode;
}

export { Modal, type ModalProps };
