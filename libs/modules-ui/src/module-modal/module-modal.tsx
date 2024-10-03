import {
  Flex,
  Heading,
  Modal,
  ModalCloseButton,
  ModalContent,
  ModalOverlay,
  Stack,
} from '@chakra-ui/react';
import { useOverlay } from 'contexts';
import { ReactNode } from 'react';

export const ModuleModal = ({
  name,
  title,
  about,
  history,
  devInfo,
  children,
  onClose,
}: {
  name: string;
  title: string;
  about: ReactNode;
  history: ReactNode;
  devInfo?: ReactNode;
  children: ReactNode;
  onClose?: () => void;
}) => {
  const { setModals, modals } = useOverlay();

  return (
    <Modal
      isOpen={modals?.[name] || false}
      onClose={() => {
        onClose?.();
        setModals?.({});
      }}
      size='6xl'
    >
      <ModalOverlay />
      <ModalContent>
        <Flex direction={{ base: 'column', md: 'row' }} height='700px'>
          <Stack
            position='relative'
            w={{ base: '100%', md: '30%' }}
            minW={{ base: 'none', md: '450px' }}
            p={{ base: 8, md: 14 }}
            spacing={10}
            borderRight='1px solid'
            borderColor='blackAlpha.200'
          >
            <Heading size='xl'>{title}</Heading>
            <ModalCloseButton
              display={{ base: 'block', md: 'none' }}
              position='absolute'
              top={4}
              right={4}
            />
            {about}

            {history}

            {devInfo}
          </Stack>

          <Stack
            bg='cyan.50'
            w={{ base: '100%', md: '70%' }}
            borderRightRadius='md'
            borderBottomLeftRadius={{ base: 'md', md: 'none' }}
            position='relative'
            align='center'
            p={{ base: 6, md: 10 }}
          >
            <ModalCloseButton
              display={{ base: 'none', md: 'block' }}
              position='absolute'
              top={4}
              right={4}
            />

            {children}
          </Stack>
        </Flex>
      </ModalContent>
    </Modal>
  );
};
