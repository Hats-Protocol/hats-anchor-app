import { CouncilButtons } from '../../../../components/council-buttons';
import { CouncilHeader } from '../../../../components/council-header';

const CouncilLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className='flex h-screen flex-col bg-white'>
      <CouncilHeader />

      <div className='relative h-full min-h-[700px]'>
        <div className='flex justify-center'>
          <CouncilButtons />
        </div>

        <div className='mx-auto h-full w-[90%] max-w-[1000px] pt-10'>
          {children}
        </div>
      </div>
    </div>
  );
};

export default CouncilLayout;
