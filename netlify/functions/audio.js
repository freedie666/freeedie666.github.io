// GET /api/audio/:id  ->  stream a stored audio file from the Blobs store
import { getStore } from '@netlify/blobs';

const STORE = 'soundboard';

export const handler = async (event) => {
  const id = (event.queryStringParameters || {}).id;
  if (!id) {
    return { statusCode: 400, body: 'Missing "id"' };
  }

  const store = getStore(STORE);
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
