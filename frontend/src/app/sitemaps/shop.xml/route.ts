import { NextResponse } from "next/server";
import { site } from "@/lib/site-config";

export const revalidate = 300;

export function GET() {
  return NextResponse.redirect(`${site.shopUrl.replace(/\/$/, "")}/sitemap.xml`, 301);
}
