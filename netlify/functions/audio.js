// GET /api/audio/:id  ->  stream a stored audio file from the Blobs store
import { getStore } from '@netlify/blobs';

const STORE = 'soundboard';

function soundStore() {
  const siteID = process.env.NETLIFY_SITE_ID || process.env.SITE_ID;
  const token = process.env.NETLIFY_API_TOKEN || process.env.NETLIFY_BLOBS_TOKEN;
  if (siteID && token) return getStore({ name: STORE, siteID, token });
  return getStore(STORE);
}

export const handler = async (event) => {
  const id = (event.queryStringParameters || {}).id;
  if (!id) {
    return { statusCode: 400, body: 'Missing "id"' };
  }

  const store = soundStore();
  const index = (await store.get('index', { type: 'json' })) || [];
  const record = index.find((s) => s.id === id);
  if (!record) {
    return { statusCode: 404, body: 'Not found' };
  }

  const ab = await store.get('audio:' + id, { type: 'arrayBuffer' });
  if (!ab) {
    return { statusCode: 404, body: 'Audio data missing' };
  }
  const buffer = Buffer.from(ab);

  return {
    statusCode: 200,
    headers: {
      'Content-Type': record.type || 'audio/mpeg',
      'Cache-Control': 'public, max-age=31536000',
      'Content-Length': String(buffer.length),
    },
    body: buffer.toString('base64'),
    isBase64Encoded: true,
  };
};
