import { Alert, AlertDescription, AlertTitle } from 'ui';

interface ErrorPageProps {
  title: string;
  description: string;
}

export function ErrorPage({ title, description }: ErrorPageProps) {
  return (
    <div className='flex min-h-[80vh] items-center justify-center p-4'>
      <Alert variant='default' className='w-full max-w-lg'>
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription>{description}</AlertDescription>
      </Alert>
    </div>
  );
}
