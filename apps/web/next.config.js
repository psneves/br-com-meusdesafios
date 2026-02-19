/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
  transpilePackages: ["@meusdesafios/shared"],
  experimental: {
    serverComponentsExternalPackages: [
      "@meusdesafios/db",
      "typeorm",
      "reflect-metadata",
      "pg",
    ],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push(
        ({ request }, callback) => {
          // Externalize TypeORM ecosystem + db package for server bundles
          if (
            request === "typeorm" ||
            request === "reflect-metadata" ||
            request === "pg" ||
            request === "@meusdesafios/db" ||
            (request && request.startsWith("@meusdesafios/db/"))
          ) {
            return callback(null, `commonjs ${request}`);
          }
          callback();
        }
      );
    }
    return config;
  },
};

module.exports = nextConfig;
