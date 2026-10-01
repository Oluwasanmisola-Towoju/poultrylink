const API_BASE = import.meta.env.VITE_API_URL || '/api/v1'

const TOKEN_KEY = 'poultrylink_access_token'
const REFRESH_KEY = 'poultrylink_refresh_token'

export const session = {
  get accessToken() { return localStorage.getItem(TOKEN_KEY) },
  get refreshToken() { return localStorage.getItem(REFRESH_KEY) },
  set(tokens = {}) {
    if (tokens.accessToken) localStorage.setItem(TOKEN_KEY, tokens.accessToken)
    if (tokens.refreshToken) localStorage.setItem(REFRESH_KEY, tokens.refreshToken)
  },
  clear() {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(REFRESH_KEY)
  },
}

async function request(path, options = {}, retry = true) {
  const headers = { ...(options.headers || {}) }
  if (!(options.body instanceof FormData)) headers['Content-Type'] = 'application/json'
  if (session.accessToken) headers.Authorization = `Bearer ${session.accessToken}`

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers })
  const body = await res.json().catch(() => ({}))

  if (res.status === 401 && retry && session.refreshToken && path !== '/auth/refresh-token') {
    try {
      const refreshed = await request('/auth/refresh-token', {
        method: 'POST', body: JSON.stringify({ refreshToken: session.refreshToken }),
      }, false)
      session.set(refreshed)
      return request(path, options, false)
    } catch {
      session.clear()
    }
  }

  if (!res.ok || body.success === false) {
    const error = new Error(body.message || 'Request failed')
    error.status = res.status
    error.details = body
    throw error
  }
  return body.data
}

export const api = {
  get: (path) => request(path),
  post: (path, data) => request(path, { method: 'POST', body: JSON.stringify(data) }),
  patch: (path, data) => request(path, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (path) => request(path, { method: 'DELETE' }),
}
