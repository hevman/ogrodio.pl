import { NextRequest, NextResponse } from "next/server";

function resolveBackendUrl() {
  return process.env.BACKEND_URL || "http://backend:3000";
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") || "";
  const topic = searchParams.get("topic") || "";
  const limit = searchParams.get("limit") || "";

  if (!query.trim()) {
    return NextResponse.json({ hits: [], total: 0 });
  }

  try {
    const backendUrl = resolveBackendUrl();
    const qs = new URLSearchParams({ q: query });
    if (topic) qs.set("topic", topic);
    if (limit) qs.set("limit", limit);

    const upstream = await fetch(`${backendUrl}/api/articles/search?${qs}`, {
      cache: "no-store",
    });

    if (!upstream.ok) {
      return NextResponse.json({ hits: [], total: 0 });
    }

    const data = await upstream.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to proxy articles search:", error);
    return NextResponse.json({ hits: [], total: 0 });
  }
}
