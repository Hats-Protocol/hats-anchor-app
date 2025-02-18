import dynamic from 'next/dynamic';

const EventHistory = dynamic(() => import('molecules').then((mod) => mod.EventHistory));

const HatHistory = () => {
  return (
    <div className='space-y-1 px-4 md:px-16'>
      <h2 className='font-medium'>Hat History</h2>

      <EventHistory type='hat' />
    </div>
  );
};

export { HatHistory };
