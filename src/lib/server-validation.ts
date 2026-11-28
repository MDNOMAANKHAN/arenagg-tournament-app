import 'server-only';

export class RequestBodyTooLargeError extends Error {
  constructor() {
    super('Request body too large');
    this.name = 'RequestBodyTooLargeError';
  }
}

export async function readBodyLimited(req: Request, maxBytes: number): Promise<Uint8Array> {
  const declared = req.headers.get('content-length');
  if (declared) {
    const size = Number(declared);
    if (!Number.isFinite(size) || size < 0) throw new Error('Invalid Content-Length');
    if (size > maxBytes) throw new RequestBodyTooLargeError();
  }
  if (!req.body) return new Uint8Array();
  const reader = req.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > maxBytes) {
        await reader.cancel();
        throw new RequestBodyTooLargeError();
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const body = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return body;
}

export async function parseFormDataLimited(req: Request, maxBytes: number): Promise<FormData> {
  const bytes = await readBodyLimited(req, maxBytes);
  const headers = new Headers(req.headers);
  headers.delete('content-length');
  headers.delete('transfer-encoding');
  const transferable = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(transferable).set(bytes);
  const rebuilt = new Request(req.url, { method: 'POST', headers, body: transferable });
  return rebuilt.formData();
}

export async function parseJsonLimited(req: Request, maxBytes: number): Promise<unknown> {
  const bytes = await readBodyLimited(req, maxBytes);
  try {
    return JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    throw new Error('Invalid JSON');
  }
}
