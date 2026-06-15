const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000/api'

function buildUrlWithParams(path, params = {}) {
  if (!params || Object.keys(params).length === 0) return path
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue
    search.append(key, String(value))
  }
  const query = search.toString()
  return query ? `${path}?${query}` : path
}

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    ...options
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: '请求失败' }))
    throw new Error(error.detail || '请求失败')
  }

  return response.json()
}

export const http = {
  get: (path, { params } = {}) => request(buildUrlWithParams(path, params)),
  post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) })
}
