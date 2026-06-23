// POST /api/upload  ->  save an audio clip into the shared Netlify Blobs store
// Body (JSON): { name: string, data: "<base64 or data URL>", type?: "audio/mpeg" }
import { getStore } from '@netlify/blobs';
import crypto from 'node:crypto';

const STORE = 'soundboard';

function soundStore() {
  const siteID = process.env.NETLIFY_SITE_ID || process.env.SITE_ID;
  const token = process.env.NETLIFY_API_TOKEN || process.env.NETLIFY_BLOBS_TOKEN;
  if (siteID && token) return getStore({ name: STORE, siteID, token });
  return getStore(STORE);
}

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch (e) {
    return { statusCode: 400, body: 'Invalid JSON body' };
  }

  let { name, data, type } = payload;
  if (!name || !data) {
    return { statusCode: 400, body: 'Missing "name" or "data"' };
  }

  // Strip data URL prefix if present, and infer type from it.
  const m = /^data:([^;]+);base64,(.*)$/s.exec(data);
  if (m) {
    type = type || m[1];
    data = m[2];
  }
  type = type || 'audio/mpeg';

  let buffer;
  try {
    buffer = Buffer.from(data, 'base64');
  } catch (e) {
    return { statusCode: 400, body: 'Invalid base64 audio data' };
  }
  if (!buffer.length) {
    return { statusCode: 400, body: 'Empty audio data' };
  }

  const store = soundStore();
  const id = crypto.randomBytes(8).toString('hex');

  // Store the audio bytes (as an ArrayBuffer for cross-runtime safety).
  const ab = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
  await store.set('audio:' + id, ab);

  // Update the metadata index.
  const index = (await store.get('index', { type: 'json' })) || [];
  const record = {
    id,
    name: String(name).slice(0, 80),
    type,
    createdAt: new Date().toISOString(),
  };
  index.push(record);
  await store.setJSON('index', index);

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ok: true, sound: record }),
  };
};
