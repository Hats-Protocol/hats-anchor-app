export const MINI_CONFIG = {
  appName: 'Hats Protocol',
  url: 'https://app.hatsprotocol.xyz',
  logoUrl: 'https://app.hatsprotocol.xyz/img/favicon-512.png',
};

const additionalLinkTags = [
  { rel: 'manifest', href: '/site.webmanifest' },
  // GENERIC
  { rel: 'shortcut icon', href: '/img/favicon.ico' },
  { rel: 'icon', href: '/img/favicon-32.png', sizes: '32x32' },
  { rel: 'icon', href: '/img/favicon-96.png', sizes: '57x57' },
  { rel: 'icon', href: '/img/favicon-96.png', sizes: '76x76' },
  { rel: 'icon', href: '/img/favicon-96.png', sizes: '96x96' },
  { rel: 'icon', href: '/img/favicon-192.png', sizes: '128x128' },
  { rel: 'icon', href: '/img/favicon-192.png', sizes: '192x192' },
  { rel: 'icon', href: '/img/favicon-512.png', sizes: '228x228' },
  // ANDROID
  { rel: 'shortcut icon', href: '/img/favicon-192.png', sizes: '196x196' },
  // IOS
  {
    rel: 'apple-touch-icon',
    href: '/img/favicon-192.png',
    sizes: '120x120',
  },
  {
    rel: 'apple-touch-icon',
    href: '/img/favicon-192.png',
    sizes: '152x152',
  },
  {
    rel: 'apple-touch-icon',
    href: '/img/favicon-192.png',
    sizes: '180x180',
  },
  // DON'T ADD FONTS HERE
];

const SeoConfig = {
  titleTemplate: `%s | ${MINI_CONFIG.appName}`,
  defaultTitle: MINI_CONFIG.appName,
  description: 'A hat for any occasion', // MINI_CONFIG.appDescription,
  openGraph: {
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: MINI_CONFIG.logoUrl,
        width: 500,
        height: 500,
        alt: 'Hats Protocol',
      },
    ],
    url: MINI_CONFIG.url,
    siteName: MINI_CONFIG.appName,
  },
  twitter: {
    handle: '@hatsprotocol',
    site: '@hatsprotocol',
    cardType: 'summary',
    image: MINI_CONFIG.logoUrl,
  },
  additionalLinkTags,
  // additionalMetaTags,
  themeColor: '#FFFFFF',
};

export default SeoConfig;
