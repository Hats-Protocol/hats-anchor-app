import { first, get } from 'lodash';
import { Metadata } from 'next';

import { icons } from './icons';

const BASE_URL = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : `http://localhost:${process.env.PORT || 3000}`;

export const MINI_CONFIG = {
  appName: 'Hats Protocol',
  shortDescription: 'Onchain Roles for Organizations',
  description:
    'Organizations work better with Hats. Save time, automate onboarding, and make better decisions with programmable onchain roles.',
  url: BASE_URL,
  logoUrl: `${BASE_URL}/img/favicon-512.png`,
  ogImageUrl: `${BASE_URL}/og.png`,
};

const TITLE = {
  default: `${MINI_CONFIG.appName} - ${MINI_CONFIG.shortDescription}`,
  template: `%s | ${MINI_CONFIG.appName}`,
};

const IMAGES = [
  {
    url: MINI_CONFIG.ogImageUrl,
    width: 1200,
    height: 630,
    alt: 'Hats Protocol',
  },
  // {
  //   url: MINI_CONFIG.logoUrl,
  //   width: 500,
  //   height: 500,
  //   alt: 'Hats Protocol',
  // },
];

export const MetadataConfig: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: TITLE,
  description: MINI_CONFIG.description,
  openGraph: {
    title: TITLE,
    description: MINI_CONFIG.description,
    images: IMAGES,
  },
  twitter: {
    card: 'summary_large_image',
    images: [get(first(IMAGES), 'url') || ''],
    title: TITLE,
    description: MINI_CONFIG.description,
  },
  icons,
};

export default MetadataConfig;
