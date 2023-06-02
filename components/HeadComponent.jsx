import Head from 'next/head';
import React from 'react';

import CONFIG from '@/constants';

const HeadComponent = ({
  title = 'Hats Protocol',
  description = 'DAO-native way to structure your organization, empowering contributors with the context, authorities, and accountabilities they need to get things done',
  url = CONFIG.url,
  img = `${CONFIG.url}/icon.jpeg`,
}) => (
  <Head>
    <title>{title}</title>
    <meta
      name='viewport'
      property='viewport'
      content='width=device-width, initial-scale=1.0'
    />
    <meta name='title' property='title' content={title} />
    <meta name='description' property='description' content={description} />
    <meta name='theme-color' property='theme-color' content='#143e7d' />

    <meta name='og:type' property='og:type' content='website' />
    <meta name='og:site_name' property='og:site_name' content='Hats Protocol' />
    <meta name='og:locale' property='og:locale' content='en_US' />

    <meta name='og:title' property='og:title' content={title} />
    <meta
      name='og:description'
      property='og:description'
      content={description}
    />
    <meta name='og:url' property='og:url' content={url} />
    <meta name='og:image' property='og:image' content={img} />

    <meta name='twitter:card' property='twitter:card' content='summary' />
    <meta name='twitter:url' property='twitter:url' content={url} />
    <meta name='twitter:site' property='twitter:site' content='@hatsprotocol' />
    <meta name='twitter:title' property='twitter:title' content={title} />
    <meta
      name='twitter:description'
      property='twitter:description'
      content={description}
    />
    <meta name='twitter:image' property='twitter:image' content={img} />
  </Head>
);

export default HeadComponent;
