/** @type {import('next').NextConfig} */
const withSvgr = require('next-plugin-svgr');

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

module.exports = withSvgr(nextConfig);
