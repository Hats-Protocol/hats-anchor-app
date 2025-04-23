import { composePlugins, withNx } from '@nx/next';

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  nx: {
    // Set this to true if you would like to use SVGR
    // See: https://github.com/gregberge/svgr
    svgr: false,
  },
  distDir: '../../dist/apps/frontend/.next',
  reactStrictMode: false,
  // This is required to support PostHog trailing slash API requests
  skipTrailingSlashRedirect: true,
  eslint: {
    dirs: [
      'app',
      // You might need to adjust these paths based on the actual paths in your Nx workspace
    ],
  },
  transpilePackages: ['d3-org-chart', '@rainbow-me/rainbowkit'],
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

const plugins = [withNx];

export default composePlugins(...plugins)(nextConfig);
