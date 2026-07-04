// ⚠️ 此文件已废弃，配置已合并到 next.config.js
// 请使用 next.config.js 作为唯一配置文件。
// 保留此文件仅作为历史参考。

/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ['192.168.71.33'],
  compress: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  swcMinify: true,
  experimental: {
    optimizeCss: true,
  },
  output: 'standalone',
  env: {
    NEXT_PUBLIC_POLLING_INTERVAL: process.env.NODE_ENV === 'production' ? '3000' : '500',
  },
};

module.exports = nextConfig;
