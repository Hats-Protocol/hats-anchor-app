import { FaArrowRight } from 'react-icons/fa';

import { Button } from './button';
import { Link } from './link';

const NotFound = () => {
  return (
    <div className='flex min-h-screen items-center justify-center'>
      <div className='flex min-w-96 flex-col items-center gap-6'>
        <h1 className='text-3xl'>Not found!</h1>
        <p className='max-w-96 text-center'>
          We couldn&apos;t find what you were looking for. Try navigating again or head home.
        </p>

        <Link href='/'>
          <Button>
            Go Home <FaArrowRight />
          </Button>
        </Link>
      </div>
    </div>
  );
};

export { NotFound };
