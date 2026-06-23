// GET /api/sounds  ->  list all stored sounds (metadata only)
import { getStore } from '@netlify/blobs';

const STORE = 'soundboard';

export const handler = async () => {
  const store = getStore(STORE);
  const index = (await store.get('index', { type: 'json' })) || [];
  const sounds = index.map((s) => ({
    id: s.id,
    name: s.name,
    type: s.type,
    createdAt: s.createdAt,
  }));
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
    body: JSON.stringify({ sounds }),
  };
};
