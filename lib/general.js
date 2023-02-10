export function parseUri(uri) {
  const parsed = JSON.parse(uri);
  return parsed;
}

export function decodeUri(uri) {
  const decoded = Buffer.from(uri.substring(29), 'base64').toString('utf8');
  return decoded;
}
