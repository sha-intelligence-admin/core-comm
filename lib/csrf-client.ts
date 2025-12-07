let csrfTokenCache: string | null = null
let inflightRequest: Promise<string> | null = null

async function requestNewToken(): Promise<string> {
  const response = await fetch("/api/csrf", {
    method: "GET",
    credentials: "include",
    headers: {
      "cache-control": "no-store",
    },
  })

  if (!response.ok) {
    throw new Error("Failed to retrieve CSRF token")
  }

  const { token } = (await response.json()) as { token: string }
  csrfTokenCache = token
  return token
}

export async function getCsrfToken(forceRefresh = false): Promise<string> {
  if (!forceRefresh && csrfTokenCache) {
    return csrfTokenCache
  }

  if (!inflightRequest || forceRefresh) {
    inflightRequest = requestNewToken().finally(() => {
      inflightRequest = null
    })
  }

  return inflightRequest
}

export async function withCsrfHeaders(forceRefresh = false): Promise<Record<string, string>> {
  const token = await getCsrfToken(forceRefresh)
  return {
    "x-csrf-token": token,
  }
}

export function clearCsrfToken() {
  csrfTokenCache = null
}
