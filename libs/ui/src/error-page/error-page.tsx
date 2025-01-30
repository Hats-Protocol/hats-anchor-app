// import _ from 'lodash';
// import { useParams } from 'next/navigation';
// import { FaArrowRight } from 'react-icons/fa';

// import Link from '../link';

const ErrorPage = () => {
  // const params = useParams();
  // const { chainId, treeId } = _.pick(params, ['chainId', 'treeId', 'hatId']);

  // const link = `/trees/${chainId}/${treeId}`;
  // if (hatId) {
  //   link = `${link}?hatId=${hatId}`;
  // }

  return (
    <div className='flex justify-center pt-[120px]'>
      <div className='space-y-6'>
        <h1 className='text-4xl'>Bummer, there was an issue!</h1>
        <p>Check the console or report in the community channel if you hit an issue</p>

        {/* <div>
          <a href='/'>
            <Button variant={!hatId && !treeId ? 'primary' : 'outline'}>
              Home
            </Button>
          </a>
          {hatId || treeId ? (
            <Link href={link}>
              <Button rightIcon={<Icon as={FaArrowRight} />}>
                Back to {hatId ? 'Hat' : 'Tree'}
              </Button>
            </Link>
          ) : null}
        </div> */}
      </div>
    </div>
  );
};

export { ErrorPage };
