/* eslint-disable @typescript-eslint/no-var-requires */
const { composePlugins, withNx } = require('@nx/next');

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  nx: {
    // Set this to true if you would like to use SVGR
    // See: https://github.com/gregberge/svgr
    svgr: false,
  },
  reactStrictMode: false,
  eslint: {
    dirs: [
      'app',
      'components',
      // You might need to adjust these paths based on the actual paths in your Nx workspace
    ],
  },
  transpilePackages: ['d3-org-chart'],
  webpack: (config) => {
    config.resolve.fallback = { fs: false, net: false, tls: false };
    config.externals.push('pino-pretty', 'lokijs', 'encoding'); // Rainbowkit polyfills
    // cache handling for Chakra components
    config.cache = {
      type: 'filesystem',
      compression: 'gzip',
      allowCollectingMemory: true,
    };
    return config;
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
    ],
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'i.seadn.io' },
      { protocol: 'https', hostname: 'metadata.ens.domains' },
      { protocol: 'https', hostname: 'effigy.im' },
    ],
    domains: ['ipfs.io'],
  },
};

const plugins = [withNx];

module.exports = composePlugins(...plugins)(nextConfig);
