import { useRudderStackAnalytics } from 'hooks';
import _ from 'lodash';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';
import { NotFound as NotFoundComponent } from 'ui';

const NotFound = () => {
  const router = useRouter();
  const analytics = useRudderStackAnalytics();

  useEffect(() => {
    if (analytics && router) {
      const data = _.pick(router, ['asPath', 'pathname', 'query']);
      analytics.page('Auto Track', '404 Page', { ...data });
    }
  }, [analytics, router]);

  return <NotFoundComponent />;
};

export default NotFound;
