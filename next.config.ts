import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
  },
  eslint: {
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
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
        "handlebars/runtime": require.resolve("handlebars/runtime"),
      }
    }

    config.module.exprContextCritical = false;

    config.externals.push({
      "@genkit-ai/firebase": "commonjs @genkit-ai/firebase"
    });

    return config;
  },
};

export default nextConfig;
