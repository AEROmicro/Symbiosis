/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', 
  images: {
    unoptimized: true,
  },
  trailingSlash: true, // This fixes "broken" looks on page refreshes
};

export default nextConfig;
