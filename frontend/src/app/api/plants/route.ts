import { NextResponse } from "next/server";

function resolveBackendUrl() {
  return process.env.BACKEND_URL || "http://backend:3000";
}

export async function GET() {
  try {
    const upstream = await fetch(`${resolveBackendUrl()}/api/plants`, {
      cache: "no-store",
    });

    if (!upstream.ok) {
      return NextResponse.json([]);
    }

    return NextResponse.json(await upstream.json());
  } catch (error) {
    console.error("Failed to proxy plants:", error);
    return NextResponse.json([]);
  }
}
