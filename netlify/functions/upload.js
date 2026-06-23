// POST /api/upload  ->  save an audio clip
// Body (JSON): { name: string, data: "<base64 or data URL>", type?: "audio/mpeg" }
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

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

  fs.mkdirSync(SOUND_DIR, { recursive: true });

  const id = crypto.randomBytes(8).toString('hex');
  const ext = type.includes('wav') ? 'wav' : type.includes('ogg') ? 'ogg' : type.includes('webm') ? 'webm' : 'mp3';
  const filename = `${id}.${ext}`;
  fs.writeFileSync(path.join(SOUND_DIR, filename), buffer);

  const meta = readMeta();
  const record = {
    id,
    name: String(name).slice(0, 80),
    filename,
    type,
    createdAt: new Date().toISOString(),
  };
  meta.push(record);
  writeMeta(meta);

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ok: true, sound: { id: record.id, name: record.name, type: record.type, createdAt: record.createdAt } }),
  };
};
