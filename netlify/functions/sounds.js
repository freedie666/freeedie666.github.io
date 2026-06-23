// GET /api/sounds  ->  list all stored sounds (metadata only)
import { getStore } from '@netlify/blobs';

const STORE = 'soundboard';

// Works on Git-connected builds (auto config) AND manual/drag-drop deploys
// (when NETLIFY_SITE_ID + NETLIFY_API_TOKEN env vars are set).
function soundStore() {
  const siteID = process.env.NETLIFY_SITE_ID || process.env.SITE_ID;
  const token = process.env.NETLIFY_API_TOKEN || process.env.NETLIFY_BLOBS_TOKEN;
  if (siteID && token) return getStore({ name: STORE, siteID, token });
  return getStore(STORE);
}

export const handler = async () => {
  const store = soundStore();
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
