'use client';

import { ReactNode } from 'react';
import { ErrorBoundary as EB } from 'react-error-boundary';

import { ErrorPage } from '../error-page';

function ErrorBoundary({ children }: ErrorBoundaryProps) {
  return (
    <EB
      FallbackComponent={ErrorPage}
      onError={(error, errorInfo) => {
        // log the error
        console.log('Error caught!');
        console.error(error);
        console.error(errorInfo);

        // record the error in an APM tool...
      }}
      onReset={() => {
        // reset the state of your app so the error doesn't happen again
      }}
    >
      {children}
    </EB>
  );
}

interface ErrorBoundaryProps {
  children: ReactNode;
}

export { ErrorBoundary };
