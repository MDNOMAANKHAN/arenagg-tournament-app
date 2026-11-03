export async function adminApi(resource: string, method: 'POST' | 'PATCH' | 'DELETE', body?: unknown, qs = '') {
  const res = await fetch(`/api/admin/${resource}${qs}`, { method, headers: { 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
  const j = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(j.error || 'Request failed');
  return j;
}
