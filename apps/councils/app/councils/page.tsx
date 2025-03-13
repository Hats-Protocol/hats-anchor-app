'use client';

import { useSearchParams } from 'next/navigation';
import { Alert, AlertDescription } from 'ui';

import { CouncilListPage } from '../../components/council-list-page';

const getErrorMessage = (error: string | null) => {
  switch (error) {
    case 'invalid_chain':
      return 'Invalid chain ID. Please check that you are using a supported network.';
    case 'invalid_address':
      return 'Invalid address format. Please check that you are using a valid Ethereum address.';
    default:
      return null;
  }
};

export default function CouncilsPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const errorMessage = getErrorMessage(error);

  return (
    <div className='flex flex-col gap-4'>
      {errorMessage && (
        <Alert variant='destructive' className='mx-auto mt-4 max-w-[1400px]'>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}
      <CouncilListPage />
    </div>
  );
}
