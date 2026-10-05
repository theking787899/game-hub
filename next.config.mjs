const server = process.env.SERVER_URL ?? "http://localhost:3001";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // O login/registro passa pelo Next (mesma origem), então o cookie de sessão
  // é gravado em localhost e o socket enxerga ele no handshake.
  async rewrites() {
    return [{ source: "/api/auth/:path*", destination: `${server}/api/auth/:path*` }];
  },
};

export default nextConfig;
