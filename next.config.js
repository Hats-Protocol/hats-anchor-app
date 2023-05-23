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
};

module.exports = nextConfig;
