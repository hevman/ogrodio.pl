import { site } from "@/lib/site-config";

export function shopPath(path = "") {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  if (cleanPath === "/sklep" || cleanPath === "/sklep/") {
    return `${site.shopUrl.replace(/\/$/, "")}/`;
  }
  if (cleanPath.startsWith("/sklep/")) {
    return `${site.shopUrl.replace(/\/$/, "")}${cleanPath.slice("/sklep".length)}`;
  }
  return `${site.shopUrl.replace(/\/$/, "")}${cleanPath === "/" ? "" : cleanPath}`;
}
