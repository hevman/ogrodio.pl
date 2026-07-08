import { site } from "@/lib/site-config";

export function sitePath(path = "") {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${site.siteUrl}${cleanPath === "/" ? "" : cleanPath}`;
}

