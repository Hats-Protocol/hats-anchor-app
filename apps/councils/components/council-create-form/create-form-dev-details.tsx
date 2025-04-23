'use client';

import posthog from 'posthog-js';

const CreateFormDevDetails = () => {
  const isDev = posthog.isFeatureEnabled('dev') || process.env.NODE_ENV === 'development';

  if (!isDev) return null;

  return <div className='mt-10'>CreateFormDevDetails</div>;
};

export { CreateFormDevDetails };
