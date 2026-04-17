/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: false,
    formats: ['image/avif', 'image/webp'],
  },
  compress: true,
  async redirects() {
    return [
      {
        source: '/solutions/:slug*',
        destination: '/selection-guide/:slug*',
        permanent: true,
      },
    ]
  }
}

module.exports = nextConfig