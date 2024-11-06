// import Link from 'next/link';

import { useParams } from 'next/navigation';

const CouncilDetails = () => {
  const { identifier } = useParams();
  console.log(identifier);

  // TODO identifier could be ID in database, slug or chainId/hatId

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex justify-center pt-20'>
        <div className='flex flex-col gap-4'>
          <h1>Council</h1>
        </div>
      </div>
    </div>
  );
};

export default CouncilDetails;
