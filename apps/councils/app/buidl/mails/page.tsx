import posthog from 'posthog-js';
import { NotFound } from 'ui';

import { MailForm } from '../../../components/mail-form';

const Mails = () => {
  const isDev = process.env.NODE_ENV === 'development' || posthog.isFeatureEnabled('dev');

  if (!isDev) return <NotFound />;

  return (
    <div className='mx-auto flex max-w-screen-md flex-col gap-6 pt-8'>
      <h1 className='text-center text-2xl font-bold'>Mail Room</h1>

      <MailForm />
    </div>
  );
};

export default Mails;
