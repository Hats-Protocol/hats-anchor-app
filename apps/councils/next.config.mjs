/* eslint-disable @typescript-eslint/no-var-requires */
import { composePlugins, withNx } from '@nx/next';
import { withSentryConfig } from '@sentry/nextjs';

const SENTRY_WEBPACK_PLUGIN_OPTIONS = {
  silent: true, // Can be used to suppress logs

  org: process.env.NEXT_PUBLIC_SENTRY_ORG,
  project: process.env.NEXT_PUBLIC_SENTRY_PROJECT,
};

const SENTRY_OPTIONS = {
  // Sentry Next.js options here
  // widenClientFileUpload: true,
  // transpileClientSDK: true,
  // tunnelRoute: '/monitoring',
  // hideSourceMaps: true,
  disableLogger: true, // Reduce bundle size
  // automaticVercelMonitors: true,
};

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
    instrumentationHook: true,
    optimizePackageImports: [
      // external pkgs
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

// Use withSentryConfig to wrap the next config
const sentryEnhancedConfig = (passedConfig) =>
  withSentryConfig(passedConfig, SENTRY_WEBPACK_PLUGIN_OPTIONS, SENTRY_OPTIONS);

const plugins = [
  // Add more Next.js plugins to this list if needed.
  withNx,
  // Sentry should be the last plugin to wrap all others
  sentryEnhancedConfig,
];

export default composePlugins(...plugins)(nextConfig);
