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
  reactStrictMode: false,
  eslint: {
    dirs: ['app', 'components'],
  },
  transpilePackages: ['d3-org-chart'],
  webpack: (config) => {
    config.resolve.fallback = { fs: false, net: false, tls: false };
    config.externals.push('pino-pretty', 'lokijs', 'encoding'); // Rainbowkit polyfills
    return config;
  },

  experimental: {
    // webpackMemoryOptimizations: true,
    optimizePackageImports: [
      // external pkgs
      '@rainbow-me/rainbowkit',
      '@tanstack/react-query',
      'd3-org-chart',
      'react-datepicker',
      'viem',
    ],
  },
  serverExternalPackages: ['require-in-the-middle'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'i.seadn.io' },
      { protocol: 'https', hostname: 'metadata.ens.domains' },
      { protocol: 'https', hostname: 'effigy.im' },
    ],
    domains: ['ipfs.io'],
  },
};

const plugins = [
  // Add more Next.js plugins to this list if needed.
  withNx,
];

export default composePlugins(...plugins)(nextConfig);
