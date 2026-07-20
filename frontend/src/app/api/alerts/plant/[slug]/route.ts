import { NextResponse } from "next/server";

function backendUrl() {
  return process.env.BACKEND_URL || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const url = new URL(request.url);
  const upstream = new URL(`${backendUrl()}/api/alerts/plant/${encodeURIComponent(slug)}`);
  for (const key of ["year", "month"]) {
    const value = url.searchParams.get(key);
    if (value) upstream.searchParams.set(key, value);
  }

  try {
    const response = await fetch(upstream, { cache: "no-store" });
    const body = await response.text();
    return new NextResponse(body, {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("content-type") || "application/json",
      },
    });
  } catch (error) {
    console.error("Failed to proxy seasonal plant alerts:", error);
    return NextResponse.json([], { status: 200 });
  }
}
