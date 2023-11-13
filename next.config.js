/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api-test/:path*',
        destination: 'https://api.reable.cloud/test/v1/buildings/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
