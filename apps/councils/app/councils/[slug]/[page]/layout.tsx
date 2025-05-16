import { CouncilsBottomMenu } from 'organisms';
import { PropsWithChildren } from 'react';
import { HatDeco } from 'ui';

import { CouncilButtons } from '../../../../components/council-buttons';
import { CouncilHeader } from '../../../../components/council-header';

const CouncilLayout = ({ children }: PropsWithChildren) => {
  return (
    <div className='flex min-h-screen flex-col bg-gray-50'>
      <CouncilHeader />
      <div className='relative flex-1'>
        <div className='hidden justify-center md:flex'>
          <CouncilButtons />
        </div>
        <div className='h-[calc(100vh-4rem)] pb-20 md:h-auto md:pb-0'>
          <div className='mx-auto w-full max-w-[1200px] bg-gray-50 py-6 md:py-10'>
            {children}

            <HatDeco height='250px' />
          </div>
        </div>
        <div className='md:hidden'>
          <CouncilsBottomMenu />
        </div>
      </div>
    </div>
  );
};

export default CouncilLayout;
