import { FaArrowRight } from 'react-icons/fa';

import { Button } from '../button';

export interface NotFoundProps {
  /** Custom home URL for the "Go Home" button */
  homeUrl?: string;
  /** Optional render function for custom link wrapping */
  linkComponent?: (props: { href: string; children: React.ReactNode }) => JSX.Element;
}

/**
 * A 404 Not Found page component with a home navigation button
 */
const NotFound = ({ homeUrl = '/', linkComponent }: NotFoundProps) => {
  const ButtonContent = (
    <Button>
      Go Home <FaArrowRight />
    </Button>
  );

  const LinkWrapper = linkComponent || ((props) => <a {...props} />);

  return (
    <div className='flex min-h-screen items-center justify-center'>
      <div className='flex min-w-96 flex-col items-center gap-6'>
        <h1 className='text-3xl'>Not found!</h1>
        <p className='max-w-96 text-center'>
          We couldn&apos;t find what you were looking for. Try navigating again or head home.
        </p>

        <LinkWrapper href={homeUrl}>{ButtonContent}</LinkWrapper>
      </div>
    </div>
  );
};

export { NotFound };
