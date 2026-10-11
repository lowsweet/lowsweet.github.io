import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  ...(process.env.LINKEAI_GITHUB_PAGES === '1' ? {
    output: 'export' as const,
    trailingSlash: true,
    distDir: '.next-pages',
    images: { unoptimized: true },
    webpack(config, { isServer, webpack }) {
      // PptxGenJS only calls these imports in Node. Honour its browser=false
      // mapping for node: scheme imports too, leaving browser Blob export intact.
      if (!isServer) {
        config.plugins.push(new webpack.NormalModuleReplacementPlugin(/^node:(fs|https)$/, (resource: { request: string }) => {
          resource.request = resource.request.replace(/^node:/, '');
        }));
        config.resolve.fallback = { ...config.resolve.fallback, fs: false, https: false };
      }
      return config;
    },
  } : {}),
};

export default nextConfig;
