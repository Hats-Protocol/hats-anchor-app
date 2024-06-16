import { WearerHats, WearerInfo, WearerStats } from 'ui';

// TODO use new tree list cards on mobile
// TODO switch Avatar back to `OblongAvatar`, something about undefined component/default export mixup
// consider using tabs for the networks on mobile to reduce the scroll end-to-end

const WearerDetail = () => (
  <>
    <div className='fixed w-full h-full bg-blue-100 opacity-[0.7] z-[-5] mt-[70px]' />

    <div className='flex flex-col items-center gap-6 p-5 md:p-20'>
      <div className='flex flex-col md:flex-row justify-between gap-10 mt-20 md:mt-10 w-full'>
        <WearerInfo />

        <WearerStats />
      </div>

      <div className='flex flex-col w-full justify-start p-6 gap-4'>
        <div className='flex flex-col gap-2'>
          <h3 className='text-2xl font-medium'>Wearer of</h3>
        </div>

        <WearerHats />
      </div>
    </div>
  </>
);

export default WearerDetail;
