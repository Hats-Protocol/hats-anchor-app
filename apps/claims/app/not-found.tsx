const NotFound = () => {
  return (
    <main className='flex h-full min-h-screen flex-col items-center justify-center'>
      <div className='flex min-w-[400px] flex-col items-center gap-6'>
        <h2 className='text-3xl'>Not found</h2>
        <p className='max-w-[400px] text-center'>
          We couldn&apos;t find what you were looking for. Try navigating again or head home.
        </p>

        <a href='/'>
          <button className='rounded-md bg-blue-500 px-4 py-2 text-white'>Go Home</button>
        </a>
      </div>
    </main>
  );
};

export default NotFound;
