/* eslint-disable react/jsx-props-no-spreading */
import '../public/styles/style.css';
import '../public/styles/OrgChart.css';
import 'react-datepicker/dist/react-datepicker.css';

import type { AppProps } from 'next/app';
import { useEffect, useState } from 'react';

import Providers from './providers';

const RootLayout = ({ Component, pageProps }: AppProps) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return <Providers>{mounted && <Component {...pageProps} />}</Providers>;
};

export default RootLayout;
