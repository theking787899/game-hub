import { io, type Socket } from "socket.io-client";

let socket: Socket | undefined;

export function getSocket(): Socket {
  socket ??= io(process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:3001", {
    withCredentials: true,
    autoConnect: false,
  });
  return socket;
}
