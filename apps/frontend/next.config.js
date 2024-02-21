/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-param-reassign */
// @ts-check

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
      'constants',
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
  webpack: (config) => {
    config.resolve.fallback = { fs: false, net: false, tls: false };
    return config;
  },
  async redirects() {
    return [
      // {
      //   source: '/trees/:chainId/:treeId/:hatId',
      //   destination: '/trees/:chainId/:treeId?hatId=:hatId',
      //   permanent: true,
      // },
      {
        source: '/trees',
        destination: '/trees/1',
        permanent: true,
      },
    ];
  },
  experimental: {
    optimizePackageImports: [
      // external pkgs
      '@chakra-ui/react',
      '@rainbow-me/rainbowkit',
      '@tanstack/react-query',
      'd3-org-chart',
      'react-datepicker',
      'viem',
      // internal packages
      'hooks',
      '@hatsprotocol/constants',
      'contexts',
      'forms',
      'hats-hooks',
      'hats-types',
      'hats-utils',
      'pages',
      'shared',
      // 'ui',
    ],
  },
};

const plugins = [
  withBundleAnalyzer,
  // Add more Next.js plugins to this list if needed.
  withNx,
];

module.exports = composePlugins(...plugins)(nextConfig);
