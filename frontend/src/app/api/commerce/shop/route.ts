import { NextRequest, NextResponse } from "next/server";

function resolveVendureShopApiUrl() {
  return (
    process.env.VENDURE_SHOP_API_URL ||
    process.env.NEXT_PUBLIC_VENDURE_SHOP_API_URL ||
    "http://commerce-server:3000/shop-api"
  );
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  let upstream: Response;

  try {
    upstream = await fetch(resolveVendureShopApiUrl(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(request.headers.get("cookie") ? { cookie: request.headers.get("cookie")! } : {}),
        ...(process.env.VENDURE_SHOP_HOST ? { Host: process.env.VENDURE_SHOP_HOST } : {}),
      },
      body,
      cache: "no-store",
    });
  } catch {
    return NextResponse.json(
      { errors: [{ message: "Nie udało się połączyć z systemem zamówień. Spróbuj ponownie za chwilę." }] },
      { status: 502 },
    );
  }

  const text = await upstream.text();
  const response = new NextResponse(text, {
    status: upstream.status,
    headers: {
      "Content-Type": upstream.headers.get("content-type") || "application/json",
    },
  });

  const setCookie = upstream.headers.get("set-cookie");
  if (setCookie) {
    response.headers.set("set-cookie", setCookie);
  }

  return response;
}
