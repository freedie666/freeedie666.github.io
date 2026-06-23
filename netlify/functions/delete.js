// POST /api/delete  ->  remove a stored sound
// Body (JSON): { id: string }
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

function writeMeta(meta) {
  fs.writeFileSync(META_FILE, JSON.stringify(meta, null, 2));
}

exports.handler = async (event) => {
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

  const meta = readMeta();
  const record = meta.find((s) => s.id === id);
  if (!record) {
    return { statusCode: 404, body: 'Sound not found' };
  }

  try {
    fs.unlinkSync(path.join(SOUND_DIR, record.filename));
  } catch (e) {
    // file may already be gone after a cold start; ignore
  }

  writeMeta(meta.filter((s) => s.id !== id));

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ok: true }),
  };
};
