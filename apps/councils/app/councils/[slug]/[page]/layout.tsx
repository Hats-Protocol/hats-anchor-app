import { HatDeco } from 'ui';

import { CouncilButtons } from '../../../../components/council-buttons';
import { CouncilHeader } from '../../../../components/council-header';

const CouncilLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className='flex min-h-screen flex-col bg-gray-50'>
      <CouncilHeader />

      <div className='relative h-full min-h-[700px]'>
        <div className='flex justify-center'>
          <CouncilButtons />
        </div>

        <div className='mx-auto h-full w-[90%] max-w-[1200px] pt-10'>{children}</div>
      </div>

      <HatDeco />
    </div>
  );
};

export default CouncilLayout;
