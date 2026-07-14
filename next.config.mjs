/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    qualities: [75, 100],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co"
      }
    ]
  },
  async rewrites() {
    return [{ source: "/Produtos/calca.png", destination: "/produtos/calca.png" }];
  }
};

export default nextConfig;
