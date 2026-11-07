import { Meta } from "@/types/global";

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details: { field: string; message: string }[] = [],
  ) {
    super(message);
  }
}

type Options = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  // Extra headers for this one call, like X-Login-Portal on the admin login
  headers?: Record<string, string>;
  // Login, signup and logout must never trigger a session refresh
  skipRefresh?: boolean;
};

// If several requests fail at once, they all wait for the same single refresh
let refreshing: Promise<boolean> | null = null;

function refreshSession() {
  refreshing ??= fetch("/api/auth/refresh", { method: "POST", credentials: "include" })
    .then((res) => res.ok)
    .catch(() => false)
    .finally(() => {
      refreshing = null;
    });
  return refreshing;
}

// Every API call in the app goes through this one function, so it is the place for things that apply
// to all calls: the headers, the cookies, the network error message and the automatic session refresh.
// (This is the Next.js version of an Angular HTTP interceptor. See docs/WEB.md.)
// Returns the whole JSON body: { data, meta? }
export async function request<T>(path: string, options: Options = {}): Promise<{ data: T; meta?: Meta }> {
  const { method = "GET", body, headers, skipRefresh = false } = options;

  let res: Response;
  try {
    res = await fetch(`/api${path}`, {
      method,
      credentials: "include", // send the login cookies
      headers: {
        Accept: "application/json",
        ...(body !== undefined && { "Content-Type": "application/json" }),
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(0, "NETWORK_ERROR", "Could not reach the server. Check your connection and try again.");
  }

  if (res.status === 204) return { data: undefined as T };

  const json = await res.json().catch(() => null);
  if (res.ok) return json;

  const error = json?.error;

  // The access cookie lasts 15 minutes. When it is gone, ask for a new one with the refresh cookie
  // and repeat the same request once.
  const sessionProblem = res.status === 401 && ["TOKEN_EXPIRED", "UNAUTHENTICATED"].includes(error?.code);
  if (sessionProblem && !skipRefresh && (await refreshSession())) {
    return request<T>(path, { ...options, skipRefresh: true });
  }

  throw new ApiError(
    res.status,
    error?.code ?? "UNKNOWN",
    error?.message ?? "Something went wrong. Please try again.",
    error?.details,
  );
}

// Same as request, but returns only the data
export async function api<T>(path: string, options?: Options): Promise<T> {
  return (await request<T>(path, options)).data;
}

// Builds "?a=1&b=2" and leaves out empty values
export function toQuery(params: Record<string, string | number | undefined>) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") query.set(key, String(value));
  }
  const text = query.toString();
  return text ? `?${text}` : "";
}