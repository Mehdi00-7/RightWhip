const PUBLIC_API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

/**
 * Resolve a ListingImage.url to a usable <img> src.
 *  - absolute URLs are used as-is
 *  - "/uploads/..." are user-uploaded photos served by the API
 *  - anything else ("/cars/..." seeded demo photos) is served from the web origin
 */
export function imageSrc(url: string): string {
  if (url.startsWith("http")) return url;
  if (url.startsWith("/uploads/")) return `${PUBLIC_API_URL}${url}`;
  return url;
}
