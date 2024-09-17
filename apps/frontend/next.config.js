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
  // This is required to support PostHog trailing slash API requests
  skipTrailingSlashRedirect: true,
  eslint: {
    dirs: [
      'app',
      // You might need to adjust these paths based on the actual paths in your Nx workspace
    ],
  },
  transpilePackages: ['d3-org-chart'],
  webpack: (config) => {
    config.resolve.fallback = { fs: false, net: false, tls: false };
    config.externals.push('pino-pretty', 'lokijs', 'encoding'); // Rainbowkit polyfills

    return config;
  },
  async redirects() {
    return [
      {
        source: '/trees',
        destination: '/trees/10', // send to optimism
        permanent: true,
      },
    ];
  },
};

const plugins = [
  withBundleAnalyzer,
  // Add more Next.js plugins to this list if needed.
  withNx,
];

module.exports = composePlugins(...plugins)(nextConfig);
