/* eslint-disable no-param-reassign */
/** @type {import('next').NextConfig} */

const nextConfig = {
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
    ],
  },
  webpack: (config) => {
    config.resolve.fallback = { fs: false, net: false, tls: false };
    return config;
  },
  async redirects() {
    return [
      {
        source: '/trees/:chainId/:treeId/:hatId',
        destination: '/trees/:chainId/:treeId',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
