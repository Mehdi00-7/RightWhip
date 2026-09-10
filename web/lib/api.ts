// Two different addresses for the same API, needed once this runs in
// separate containers:
//  - API_URL: how the Next.js SERVER reaches the API (e.g. the Docker
//    Compose service name "http://api:8000" — unreachable as "localhost"
//    from inside a different container).
//  - NEXT_PUBLIC_API_URL: how the user's BROWSER reaches the API (must be
//    a real, publicly-resolvable address). Also the fallback for API_URL,
//    since in plain local dev (no Docker) both are the same address.
const API_URL =
  process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`);
  if (!res.ok) throw new Error(`API ${res.status}: ${path}`);
  return res.json();
}

// For Server Components that need the logged-in user's data. Node has no
// browser cookie jar, so the caller must read the cookie (via next/headers)
// and pass it in — this just does the repeated fetch + forwarding part.
export async function apiGetAuthed<T>(
  path: string,
  token: string | undefined
): Promise<{ data: T | null; status: number }> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: token ? { Cookie: `access_token=${token}` } : {},
    cache: "no-store",
  });
  if (!res.ok) {
    return { data: null, status: res.status };
  }
  return { data: await res.json(), status: res.status };
}
