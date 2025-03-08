'use client';
import { chainsList } from '@hatsprotocol/config';
import { keys, map, toNumber } from 'lodash';
import { SubgraphCheck } from 'molecules';
import { Card } from 'ui';

const SubgraphDebug = () => {
  return (
    <>
      <div className='px-4 py-20 md:px-20 lg:px-[100px] lg:py-[100px]'>
        <div className='mb-3 flex items-center justify-center pb-12'>
          <h2 className='text-2xl font-bold'>Subgraphs Status</h2>
        </div>

        <Card className='mx-auto max-w-[600px] p-8'>
          <div className='flex flex-col gap-4'>
            {map(keys(chainsList), (chainId) => {
              return <SubgraphCheck chainId={toNumber(chainId)} key={chainId} />;
            })}
          </div>
        </Card>
      </div>

      <div className='fixed left-0 top-0 z-[-5] mt-[40px] h-full w-full bg-blue-100 opacity-[0.7] md:mt-[70px]' />
    </>
  );
};

export default SubgraphDebug;
