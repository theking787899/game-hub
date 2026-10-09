import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const server = process.env.SERVER_URL ?? "http://localhost:3001";

  const response = await fetch(`${server}/user`, {
    method: "GET",
    headers: {
      cookie: req.headers.get("cookie") ?? "",
    },
    cache: "no-store",
  });

  const body = await response.text();

  return new NextResponse(body, {
    status: response.status,
    headers: {
      "Content-Type":
        response.headers.get("content-type") ?? "application/json",
    },
  });
}