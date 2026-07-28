/** @type {import('next').NextConfig} */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig = {
  reactStrictMode: true,
  output: "export", // fully static site — deployable to GitHub Pages / any CDN
  trailingSlash: true, // emit folder/index.html so GitHub Pages serves nested routes
  basePath,
  images: { unoptimized: true },
};

export default nextConfig;
