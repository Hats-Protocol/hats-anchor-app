/** @type {import('next').NextConfig} */
// eslint-disable-next-line @typescript-eslint/no-var-requires

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
