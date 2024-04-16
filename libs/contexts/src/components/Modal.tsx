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
import _ from 'lodash';
import { ReactNode } from 'react';
import {
  // AppModals,
  // ClaimsModals,
  OverlayContextProps,
  StandaloneOverlayContextProps,
} from 'types';

// type ModalName = keyof Partial<ClaimsModals> | keyof Partial<AppModals>;

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
  footer,
  customHeader,
  isOpen,
  onClose,
  size = '2xl',
  localOverlay,
  children,
}: ModalProps) => {
  const { modals, closeModals } = _.pick(localOverlay, [
    'modals',
    'closeModals',
  ]);

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      closeModals?.();
    }
  };

  return (
    <ChakraModal
      isOpen={isOpen || _.get(modals, name) || false}
      onClose={handleClose}
      size={size}
    >
      <ModalOverlay />
      <ModalContent
        // background={props.bgColor ? props.bgColor : 'gray.800'}
        minWidth='20vw'
        padding={4}
        display='flex'
        flexDirection='column'
        // set mobile modal fixed to bottom of screen
        marginTop={{ base: 'auto', md: '3.75rem' }}
        marginBottom={{ base: '0', md: 'auto' }}
        borderBottomRadius={{ base: '0', md: 'md' }}
      >
        {customHeader || (
          <ModalHeader>
            <Heading size={size}>{title}</Heading>
          </ModalHeader>
        )}
        <ModalCloseButton />
        <ModalBody>{content || children}</ModalBody>
        {footer && <ModalFooter>{footer}</ModalFooter>}
      </ModalContent>
    </ChakraModal>
  );
};

export default Modal;

interface ModalProps {
  name: string;
  title?: string;
  content?: string;
  footer?: ReactNode;
  customHeader?: ReactNode;
  isOpen?: boolean;
  onClose?: () => void;
  size?: string | object;
  localOverlay: StandaloneOverlayContextProps | OverlayContextProps | undefined;
  children: ReactNode;
}
