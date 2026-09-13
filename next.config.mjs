/** @type {import('next').NextConfig} */
const nextConfig = {
  // Hanya gunakan static HTML export jika flag STATIC_EXPORT diset
  ...(process.env.STATIC_EXPORT === 'true' ? { output: 'export' } : {}),
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
};

export default nextConfig;
