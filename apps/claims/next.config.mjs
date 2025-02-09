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

  experimental: {
    optimizePackageImports: [
      // external pkgs
      '@uiw/react-md-editor',
      '@rainbow-me/rainbowkit',
      '@tanstack/react-query',
      'd3-org-chart',
      'viem',
      'wagmi',
    ],
  },
};

const plugins = [withNx];

export default composePlugins(...plugins)(nextConfig);
