import { BaseModal, ModalContent, useOverlay } from 'contexts';
import { get } from 'lodash';
import { ReactNode } from 'react';
import { cn } from 'ui';
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
  const { modals, setModals } = useOverlay();
  const isOpen = get(modals, name) || false;

  const handleClose = () => {
    setModals?.({});
  };

  return (
    <BaseModal open={isOpen || get(modals, name) || false} onOpenChange={handleClose}>
      <ModalContent
        className={cn(
          'min-w-20vw rounded-b-0 mb-0 mt-auto flex h-[751px] w-full max-w-[1200px] flex-col bg-white p-0 md:mb-auto md:mt-4 md:rounded-2xl',
        )}
      >
        <div className='flex min-h-[750px] flex-col items-center md:flex-row'>
          <div className='relative hidden h-full w-[30%] flex-col gap-10 border-r border-black/20 p-14 md:flex md:min-w-[450px]'>
            <h2 className='text-2xl font-bold'>{title}</h2>

            {about}

            {history}

            {devInfo}
          </div>

          <div className='relative flex h-full w-full flex-col items-center rounded-r-xl bg-cyan-50 p-6 md:p-10'>
            {children}
          </div>
        </div>
      </ModalContent>
    </BaseModal>
  );
};
