import React from 'react';
import { parseUri, decodeUri } from '../lib/general';

const UriComponent = ({ c }) => {
  const legibleUri = parseUri(decodeUri(c));
  const { properties } = legibleUri;

  return (
    <section>
      <div className='overflow-hidden bg-white shadow sm:rounded-lg'>
        <div className='px-4 py-2 sm:px-6'>
          <h3 className='text-lg font-medium leading-6 text-gray-900'>
            Hats Protocol 4 lyfe
          </h3>
        </div>
        <div className='border-t border-gray-200 px-4 py-2 sm:p-0'>
          <dl className='sm:divide-y sm:divide-gray-200'>
            <div className='py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-2 sm:px-6'>
              <dt className='text-sm font-medium text-gray-500'>Name</dt>
              <dd className='mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0'>
                {legibleUri['name & description']}
              </dd>
            </div>
            <div className='py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-2 sm:px-6'>
              <dt className='text-sm font-medium text-gray-500'>Domain</dt>
              <dd className='mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0'>
                {legibleUri.domain}
              </dd>
            </div>
            <div className='py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-2 sm:px-6'>
              <dt className='text-sm font-medium text-gray-500'>Hat ID</dt>
              <dd className='mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0'>
                {legibleUri.id}
              </dd>
            </div>
            <div className='py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-2 sm:px-6'>
              <dt className='text-sm font-medium text-gray-500'>
                Pretty Hat ID
              </dt>
              <dd className='mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0'>
                {legibleUri['pretty id']}
              </dd>
            </div>
            <div className='py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-2 sm:px-6'>
              <dt className='text-sm font-medium text-gray-500'>Status</dt>
              <dd className='mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0'>
                {legibleUri.status}
              </dd>
            </div>
            <div>
              <p className='mt-1 max-w-2xl text-sm text-gray-500'>Properties</p>
            </div>
            <div className='py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-2 sm:px-6'>
              <dt className='text-sm font-medium text-gray-500'>
                Current Supply
              </dt>
              <dd className='mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0'>
                {properties['current supply']}
              </dd>
            </div>
            <div className='py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-2 sm:px-6'>
              <dt className='text-sm font-medium text-gray-500'>Supply Cap</dt>
              <dd className='mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0'>
                {properties['supply cap']}
              </dd>
            </div>
            <div className='py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-2 sm:px-6'>
              <dt className='text-sm font-medium text-gray-500'>
                Admin Hat ID
              </dt>
              <dd className='mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0'>
                {properties['admin (id)']}
              </dd>
            </div>
            <div className='py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-2 sm:px-6'>
              <dt className='text-sm font-medium text-gray-500'>
                Admin Pretty ID
              </dt>
              <dd className='mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0'>
                {properties['admin (pretty id)']}
              </dd>
            </div>
            <div className='py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-2 sm:px-6'>
              <dt className='text-sm font-medium text-gray-500'>
                Oracle Address
              </dt>
              <dd className='mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0'>
                {properties['oracle address']}
              </dd>
            </div>
            <div className='py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-2 sm:px-6'>
              <dt className='text-sm font-medium text-gray-500'>
                Conditions Address
              </dt>
              <dd className='mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0'>
                {properties['conditions address']}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
};

export default UriComponent;
