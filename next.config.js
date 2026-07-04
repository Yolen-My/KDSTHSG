/** @type {import('next').NextConfig} */
const buildId = process.env.NEXT_PUBLIC_BUILD_ID || `qhduan-${Date.now()}`;

const nextConfig = {
  devIndicators: false,
  allowedDevOrigins: ['192.168.71.33', '124.223.202.28'],
  generateBuildId: async () => buildId,

  // ============ 生产环境优化 ============

  // Gzip/Brotli 压缩，减少网络传输量
  compress: true,

  // 图片优化：支持现代格式，减少图片体积
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // SWC 压缩（替代 Terser），更快的构建和更小的输出
  swcMinify: true,

  // CSS 优化
  experimental: {
    optimizeCss: true,
  },

  // 独立输出模式（适合生产部署）
  output: 'standalone',

  // 环境变量
  env: {
    NEXT_PUBLIC_POLLING_INTERVAL: process.env.NODE_ENV === 'production' ? '3000' : '500',
  },

  // PocketBase 反向代理
  async rewrites() {
    return [
      {
        source: '/pb/:path*',
        destination: 'http://127.0.0.1:8090/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
