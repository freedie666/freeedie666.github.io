// GET /api/sounds  ->  list all stored sounds (metadata only)
const fs = require('fs');
const path = require('path');

const META_FILE = '/tmp/sounds.json';

function readMeta() {
  try {
    return JSON.parse(fs.readFileSync(META_FILE, 'utf8'));
  } catch (e) {
    return [];
  }
}

exports.handler = async () => {
  const sounds = readMeta().map((s) => ({
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
