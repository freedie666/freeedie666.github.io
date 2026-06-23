// POST /api/delete  ->  remove a stored sound from the Blobs store
// Body (JSON): { id: string }
import { getStore } from '@netlify/blobs';

const STORE = 'soundboard';

export const handler = async (event) => {
  if (event.httpMethod !== 'POST' && event.httpMethod !== 'DELETE') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let id;
  try {
    id = JSON.parse(event.body || '{}').id;
  } catch (e) {
    return { statusCode: 400, body: 'Invalid JSON body' };
  }
  if (!id) {
    return { statusCode: 400, body: 'Missing "id"' };
  }

  const store = getStore(STORE);
  const index = (await store.get('index', { type: 'json' })) || [];
  if (!index.find((s) => s.id === id)) {
    return { statusCode: 404, body: 'Sound not found' };
  }

  await store.delete('audio:' + id);
  await store.setJSON('index', index.filter((s) => s.id !== id));

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ok: true }),
  };
};
