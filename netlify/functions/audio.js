// GET /api/audio/:id  ->  stream the stored audio file
const fs = require('fs');
const path = require('path');

const SOUND_DIR = '/tmp/sounds';
const META_FILE = '/tmp/sounds.json';

function readMeta() {
  try {
    return JSON.parse(fs.readFileSync(META_FILE, 'utf8'));
  } catch (e) {
    return [];
  }
}

exports.handler = async (event) => {
  const id = (event.queryStringParameters || {}).id;
  if (!id) {
    return { statusCode: 400, body: 'Missing "id"' };
  }

  const record = readMeta().find((s) => s.id === id);
  if (!record) {
    return { statusCode: 404, body: 'Not found' };
  }

  const filePath = path.join(SOUND_DIR, record.filename);
  let buffer;
  try {
    buffer = fs.readFileSync(filePath);
  } catch (e) {
    return { statusCode: 404, body: 'File missing (cold start may have cleared /tmp)' };
  }

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
