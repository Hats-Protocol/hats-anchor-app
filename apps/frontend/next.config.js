/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-param-reassign */

// eslint-disable-next-line import/no-extraneous-dependencies
const { composePlugins, withNx } = require('@nx/next');

// eslint-disable-next-line import/no-extraneous-dependencies
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  nx: {
    // Set this to true if you would like to use SVGR
    // See: https://github.com/gregberge/svgr
    svgr: false,
  },
  reactStrictMode: true,
  eslint: {
    dirs: [
      'pages',
      'components',
      // '@hatsprotocol/constants',
      'contexts',
      'forms',
      'gql',
      'hooks',
      'lib',
      'theme',
      'utils',
      // You might need to adjust these paths based on the actual paths in your Nx workspace
    ],
  },
  transpilePackages: ['d3-org-chart'],
  async redirects() {
    return [
      {
        source: '/trees',
        destination: '/trees/10', // send to optimism
        permanent: true,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/ingest/static/:path*',
        destination: 'https://us-assets.i.posthog.com/static/:path*',
      },
      {
        source: '/ingest/:path*',
        destination: 'https://us.i.posthog.com/:path*',
      },
    ];
  },
  experimental: {
    optimizePackageImports: [
      // external pkgs
      // '@chakra-ui/react',
      // 'd3-org-chart',
      // 'react-datepicker',
      // internal packages
      // '@hatsprotocol/constants',
      // 'contexts',
      // 'forms',
      // 'hats-hooks',
      // 'hats-utils',
      // 'hooks',
      // 'modules-ui',
      // 'pages',
      // 'shared',
      // 'types',
      // 'ui',
      // 'utils',
    ],
  },
};

const plugins = [
  withBundleAnalyzer,
  // Add more Next.js plugins to this list if needed.
  withNx,
];

module.exports = composePlugins(...plugins)(nextConfig);
