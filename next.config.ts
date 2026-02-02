import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    // ignoreBuildErrors: false,
  },
  eslint: {
    // ignoreDuringBuilds: false,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "image.tmdb.org",
        port: "",
        pathname: "/**",
      },
    ],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [...(config.externals || []), "@opentelemetry/exporter-jaeger"];
    }

    config.resolve = {
      ...config.resolve,
      fallback: {
        ...config.resolve?.fallback,
        // Fixes "require.extensions is not supported" for handlebars
        "handlebars/runtime": require.resolve("handlebars/runtime"),
      }
    }

    // Ignore require.extensions warning
    config.module.exprContextCritical = false;

    // Handle @genkit-ai/firebase not being found (it's likely an optional peer dep)
    config.externals.push({
      "@genkit-ai/firebase": "commonjs @genkit-ai/firebase"
    });

    return config;
  },
};

export default nextConfig;
