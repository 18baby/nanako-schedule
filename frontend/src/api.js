const BASE = '/api/schedules'

async function request(url, options = {}) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    let msg = `요청 실패 (${res.status})`
    try {
      const body = await res.json()
      if (body.detail) msg = typeof body.detail === 'string' ? body.detail : JSON.stringify(body.detail)
    } catch {
      /* ignore */
    }
    throw new Error(msg)
  }
  return res.status === 204 ? null : res.json()
}

export const api = {
  list: () => request(BASE),
  create: (data) => request(BASE, { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`${BASE}/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (id) => request(`${BASE}/${id}`, { method: 'DELETE' }),
}
