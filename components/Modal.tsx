import {
  Heading,
  Modal as ChakraModal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/react';
import React, { ReactNode } from 'react';

/**
 * Modal component, wraps Chakra's default Modal
 * @param {string} name name of modal
 * @param {string} title title of modal used in header
 * @param {React.ReactNode} content content of modal
 * @param {string} size size of modal, defaults to 2xl
 * @note Include either `isOpen && onClose` or `localOverlay`
 * @param {boolean} isOpen whether modal is open, fallback to OverlayContext
 * @param {function} onClose function to close modal, fallback to OverlayContext
 * @param {object} localOverlay local OverlayContext from parent
 * @returns Modal component and handlers
 */
const Modal = ({
  name,
  title,
  content,
  isOpen,
  onClose,
  size = '2xl',
  localOverlay,
  children,
}: ModalProps) => {
  let modals;
  let closeModals;
  if (localOverlay) {
    modals = localOverlay.modals;
    closeModals = localOverlay.closeModals;
  }

  // TODO flexible heading size

  return (
    <ChakraModal
      isOpen={isOpen || modals?.[name]}
      onClose={onClose || closeModals}
      size={size}
    >
      <ModalOverlay />
      <ModalContent
        // background={props.bgColor ? props.bgColor : 'gray.800'}
        minWidth='20vw'
        // paddingY={8}
      >
        <ModalHeader>
          <Heading size='lg'>{title}</Heading>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>{content || children}</ModalBody>
        <ModalFooter />
      </ModalContent>
    </ChakraModal>
  );
};

export default Modal;

interface ModalProps {
  name: string;
  title: string;
  content?: string;
  isOpen?: boolean;
  onClose?: () => void;
  size?: string;
  localOverlay: any;
  children: ReactNode;
}
