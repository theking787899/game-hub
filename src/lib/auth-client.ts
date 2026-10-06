import { createAuthClient } from "better-auth/react";

// Sem baseURL: usa a origem do próprio site, e o Next encaminha /api/auth ao servidor.
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_SOCKET_URL!, 
  credentials: "include"
});