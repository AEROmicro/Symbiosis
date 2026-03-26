/** @type {import('next').NextConfig} */
const nextConfig = {
  // DELETE output: 'export' <--- This is what's causing the /api/market error
  images: {
    unoptimized: true,
  },
  // You can keep trailingSlash if you like, but it's optional with the adapter
  trailingSlash: true, 
};

export default nextConfig;
