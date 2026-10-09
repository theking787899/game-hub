const server = process.env.SERVER_URL ?? "http://localhost:3001";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Login, registro e perfil passam pelo Next (mesma origem), então o cookie
  // de sessão é gravado em localhost e chega ao servidor junto com a requisição.
  async rewrites() {
    return [
      { source: "/api/auth/:path*", destination: `${server}/api/auth/:path*` },
      { source: "/api/user", destination: `${server}/user` },
    ];
  },
};

export default nextConfig;