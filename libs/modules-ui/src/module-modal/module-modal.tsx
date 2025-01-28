import { Modal } from 'contexts';
import { ReactNode } from 'react';
import { BsX } from 'react-icons/bs';
import { Button } from 'ui';

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
  return (
    <Modal name={name} onClose={onClose}>
      <div className='flex h-[700px] flex-col items-center gap-4 md:flex-row'>
        <div className='border-blackAlpha-200 relative flex hidden w-[30%] gap-10 border-r p-14 md:flex md:min-w-[450px]'>
          <h2 className='text-2xl font-bold'>{title}</h2>

          {about}

          {history}

          {devInfo}
        </div>

        <div className='border-r-md border-top-left-md border-bottom-left-md relative flex h-[auto] w-[70%] flex-col items-center bg-cyan-50 p-6 md:p-10'>
          <Button className='absolute right-4 top-4' onClick={onClose}>
            <BsX />
          </Button>

          {children}
        </div>
      </div>
    </Modal>
  );
};
