/**
 * TravelGenie API client.
 *
 * In development Vite proxies /api to the FastAPI server (vite.config.js).
 * In production set VITE_API_URL to the deployed backend origin.
 */
import { toApiPayload } from './planner';

export const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

export class ApiError extends Error {
  constructor(message, { code = 'upstream_error', status = 0, retryable = true } = {}) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.retryable = retryable;
  }
}

const NETWORK_MESSAGE = "Can't reach the TravelGenie server. Check your connection, or make sure the backend is running.";

async function errorFromResponse(res) {
  let body = null;
  try { body = await res.json(); } catch { /* not JSON */ }
  const err = body?.error;
  if (err?.message) return new ApiError(err.message, { code: err.code, status: res.status, retryable: err.retryable ?? res.status >= 500 });
  if (res.status === 422) return new ApiError('Some trip details look invalid. Please review the form.', { code: 'bad_request', status: 422, retryable: false });
  if (res.status === 404) return new ApiError('The planning service is not available at this address.', { code: 'not_found', status: 404, retryable: false });
  return new ApiError(`The server returned an error (${res.status}). Please try again.`, { status: res.status });
}

export async function getHealth({ signal } = {}) {
  const res = await fetch(`${API_BASE}/api/health`, { signal });
  if (!res.ok) throw await errorFromResponse(res);
  return res.json();
}

/** Non-streaming generation. Resolves to a Trip. */
export async function planTrip(request, { signal } = {}) {
  let res;
  try {
    res = await fetch(`${API_BASE}/api/plan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(toApiPayload(request)),
      signal,
    });
  } catch (e) {
    if (e.name === 'AbortError') throw e;
    throw new ApiError(NETWORK_MESSAGE, { code: 'network' });
  }
  if (!res.ok) throw await errorFromResponse(res);
  return res.json();
}

/**
 * Streaming generation over Server-Sent Events.
 * Calls onProgress({stage, message, percent, day, total_days}) as Gemini writes
 * the plan, and resolves to the final Trip. Falls back to the non-streaming
 * endpoint if streaming isn't supported by the server or a proxy.
 */
export async function planTripStream(request, { signal, onProgress } = {}) {
  let res;
  try {
    res = await fetch(`${API_BASE}/api/plan/stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream' },
      body: JSON.stringify(toApiPayload(request)),
      signal,
    });
  } catch (e) {
    if (e.name === 'AbortError') throw e;
    throw new ApiError(NETWORK_MESSAGE, { code: 'network' });
  }

  const type = res.headers.get('content-type') || '';
  if (res.status === 404 || res.status === 405 || (res.ok && !type.includes('text/event-stream')) || !res.body) {
    return planTrip(request, { signal });
  }
  if (!res.ok) throw await errorFromResponse(res);

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let result = null;

  const handleEvent = (block) => {
    let event = 'message';
    const data = [];
    for (const line of block.split('\n')) {
      if (line.startsWith('event:')) event = line.slice(6).trim();
      else if (line.startsWith('data:')) data.push(line.slice(5).replace(/^ /, ''));
    }
    if (!data.length) return;
    let payload;
    try { payload = JSON.parse(data.join('\n')); } catch { return; }
    if (event === 'progress') onProgress?.(payload);
    else if (event === 'result') result = payload;
    else if (event === 'error') {
      throw new ApiError(payload.message || 'Something went wrong while planning.', { code: payload.code, retryable: payload.retryable ?? true });
    }
  };

  try {
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true }).replace(/\r\n/g, '\n');
      let idx;
      while ((idx = buffer.indexOf('\n\n')) !== -1) {
        const block = buffer.slice(0, idx);
        buffer = buffer.slice(idx + 2);
        handleEvent(block);
      }
    }
    if (buffer.trim()) handleEvent(buffer);
  } catch (e) {
    if (e.name === 'AbortError' || e instanceof ApiError) throw e;
    throw new ApiError('The connection dropped while planning. Please try again.', { code: 'network' });
  } finally {
    reader.releaseLock?.();
  }

  if (!result) throw new ApiError('The plan ended unexpectedly. Please try again.', { code: 'incomplete' });
  return result;
}
