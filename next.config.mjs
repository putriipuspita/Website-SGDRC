/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  allowedDevOrigins: ['192.168.0.100', '192.168.1.100', 'localhost', '127.0.0.1'],
  async headers() {
    return [
      {
        source: '/aset/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
