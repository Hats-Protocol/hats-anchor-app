'use client';

import { Button, Card } from 'ui';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  // useEffect(() => {
  //   // Optionally log the error to an error reporting service
  //   console.error(error);
  // }, [error]);

  return (
    <main className='flex h-full min-h-screen flex-col items-center justify-center'>
      <div className='flex w-[60%] flex-col gap-10'>
        <h2 className='text-center text-xl font-bold'>Something went wrong</h2>

        <div className='flex justify-center'>
          {/* Attempt to recover by trying to re-render the route */}
          <Button onClick={() => reset()}>Refresh</Button>
        </div>

        <Card>
          <div className='m-4 flex flex-col gap-2'>
            <h2 className='text-lg font-medium'>Error Details</h2>

            <div className='bg-slate-800'>
              <p className='font-mono text-white'>{error.message}</p>
            </div>
          </div>
        </Card>
      </div>
    </main>
  );
}
