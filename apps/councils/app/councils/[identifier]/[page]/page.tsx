import { Button, ButtonGroup } from '@chakra-ui/react';
import Link from 'next/link';

const CouncilDetails = ({
  params: { identifier, page },
}: {
  params: { identifier: string; page: string };
}) => {
  console.log(identifier);

  // TODO identifier could be ID in database, slug or chainId/hatId

  return (
    <div className='flex h-screen flex-col bg-white'>
      <div className='bg-slate-200 pt-20'>
        <div className='mx-auto w-[90%] max-w-[800px] py-12'>
          <h1 className='text-2xl font-bold'>{identifier}</h1>
        </div>
      </div>

      <div className='relative h-full min-h-[700px]'>
        <div className='flex justify-center'>
          <ButtonGroup isAttached position='absolute' top={-5} bg='white'>
            <Link href={`/councils/${identifier}/transactions`} passHref>
              <Button variant='primary' colorScheme='blue.500'>
                Transactions
              </Button>
            </Link>
            <Link href={`/councils/${identifier}/assets`} passHref>
              <Button variant='outlineMatch' colorScheme='blue.500'>
                Assets
              </Button>
            </Link>
            <Link href={`/councils/${identifier}/members`} passHref>
              <Button variant='outlineMatch' colorScheme='blue.500'>
                Members
              </Button>
            </Link>
            <Link href={`/councils/${identifier}/manage`} passHref>
              <Button variant='outlineMatch' colorScheme='blue.500'>
                Manage
              </Button>
            </Link>
          </ButtonGroup>
        </div>

        <div className='mx-auto h-full w-[90%] max-w-[800px] pt-10'>
          <div>{page}</div>
        </div>
      </div>
    </div>
  );
};

export default CouncilDetails;
