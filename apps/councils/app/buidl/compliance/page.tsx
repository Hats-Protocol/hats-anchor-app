import Link from 'next/link';

const Compliance = () => {
  return (
    <div className='flex flex-col gap-4'>
      <div className='flex justify-center pt-20'>
        <div className='flex flex-col gap-4'>
          <Link href='https://flow-dev.togggle.io/HatsProtocol/kyc'>
            <button className='rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700'>
              Test Togggle
            </button>
          </Link>

          <button disabled className='rounded bg-gray-500 px-4 py-2 font-bold text-white'>
            Test Civic
          </button>
        </div>
      </div>
    </div>
  );
};

export default Compliance;
