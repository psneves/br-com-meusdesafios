/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@challengeos/shared", "@challengeos/db"],
};

module.exports = nextConfig;
