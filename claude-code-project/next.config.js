/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // This is needed for the Stockfish WASM module to work properly
  webpack: (config) => {
    config.experiments = {
      asyncWebAssembly: true,
      layers: true,
    };
    return config;
  },
}

module.exports = nextConfig