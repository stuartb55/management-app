/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: false, // Set to false for production
  },
  typescript: {
    ignoreBuildErrors: false, // Set to false for production
  },
  images: {
    // Set to `false` for production to enable Next.js Image Optimization
    // If you're hosting images on a CDN, you might need to configure `remotePatterns` here.
    unoptimized: false,
  },
  webpack: (config, { isServer }) => {
    // Exclude 'pg-native' from the client-side bundle
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        pg: false,
        'pg-native': false,
        lokijs: false,
        'pino-pretty': false,
      };
    }

    return config;
  },
};

export default nextConfig;