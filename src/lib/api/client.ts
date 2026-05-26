export class ApiError extends Error {
  constructor(
    readonly code: number | string,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });

  const json = await res.json();

  if (json.code !== 0) {
    if (json.code === 401 && typeof window !== "undefined") {
      window.location.href = "/login";
    }
    throw new ApiError(json.code, json.message);
  }

  return json.data as T;
}
