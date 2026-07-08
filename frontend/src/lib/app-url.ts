import { site } from "@/lib/site-config";

export function appPath(path = "") {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${site.appUrl}${cleanPath}`;
}

