import { Alert, AlertDescription, AlertTitle } from '../alert';

interface ErrorPageProps {
  title: string;
  description: string;
}

export const ErrorPage = ({
  title = 'Bummer, there was an issue',
  description = 'Check the console or report in the community channel if you hit an issue',
}: ErrorPageProps) => {
  return (
    <div className='p-20'>
      <Alert variant='default' className='mx-auto max-w-lg'>
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription>{description}</AlertDescription>
      </Alert>
    </div>
  );
};
