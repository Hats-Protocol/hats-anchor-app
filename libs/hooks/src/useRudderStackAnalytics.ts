import type { RudderAnalytics as RudderAnalyticsType } from '@rudderstack/analytics-js';
import { useEffect, useState } from 'react';

const RUDDER_WRITE_KEY = process.env.NEXT_PUBLIC_RUDDER_WRITE_KEY || '';
const DATA_PLANE_URL = process.env.NEXT_PUBLIC_RUDDER_DATA_PLANE_URL || '';

const useRudderStackAnalytics = (): RudderAnalyticsType | undefined => {
  const [analytics, setAnalytics] = useState<RudderAnalyticsType>();

  useEffect(() => {
    if (!analytics) {
      const initialize = async () => {
        const { RudderAnalytics } = await import('@rudderstack/analytics-js');
        const analyticsInstance = new RudderAnalytics();

        analyticsInstance.load(RUDDER_WRITE_KEY, DATA_PLANE_URL);

        analyticsInstance.ready(() => {
          // eslint-disable-next-line no-console
          console.log('We are all set!!!');
        });

        setAnalytics(analyticsInstance);
      };

      // eslint-disable-next-line no-console
      initialize().catch((e) => console.log(e));
    }
  }, [analytics]);

  return analytics;
};

export default useRudderStackAnalytics;
