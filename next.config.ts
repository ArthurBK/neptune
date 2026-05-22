import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

const projectRoot = dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  reactCompiler: true,
  turbopack: {
    root: projectRoot,
  },
  async redirects() {
    const categories = ['interiors', 'gardens', 'arts', 'fashion', 'travel']

    return [
      ...categories.map((category) => ({
        source: `/${category}`,
        destination: '/stories',
        permanent: true,
      })),
      ...categories.map((category) => ({
        source: `/${category}/:slug`,
        destination: '/stories/:slug',
        permanent: true,
      })),
    ]
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.shopify.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
