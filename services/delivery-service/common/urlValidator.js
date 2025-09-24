const { URL } = require('url');
const net = require('net');

function isIPv4Private(ip) {
  if (net.isIP(ip) !== 4) return false;
  const parts = ip.split('.').map((p) => parseInt(p, 10));
  if (parts.length !== 4 || parts.some((n) => Number.isNaN(n))) return false;

  if (parts[0] === 10) return true;
  if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
  if (parts[0] === 192 && parts[1] === 168) return true;
  if (parts[0] === 127) return true;

  return false;
}

function isIPv6Private(ip) {
  if (net.isIP(ip) !== 6) return false;
  const lower = ip.toLowerCase();
  if (lower === '::1') return true;
  if (lower.startsWith('fc') || lower.startsWith('fd')) return true;
  if (lower.startsWith('fe80')) return true;
  return false;
}

function isHostIpPrivate(hostname) {
  if (net.isIP(hostname)) {
    return isIPv4Private(hostname) || isIPv6Private(hostname);
  }
  return false;
}

function isUrlAllowed(urlString, options = {}) {
  const { allowedHosts = process.env.ALLOWED_EXTERNAL_HOSTS, requireWhitelist = false } = options;

  let parsed;
  try {
    parsed = new URL(urlString);
  } catch (err) {
    return false;
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) return false;

  const hostname = parsed.hostname;
  if (isHostIpPrivate(hostname)) return false;

  if (requireWhitelist) {
    if (!allowedHosts) return false;
    const list = allowedHosts.split(',').map((s) => s.trim()).filter(Boolean);
    if (list.length === 0) return false;
    return list.some((entry) => entry === hostname || hostname.endsWith('.' + entry));
  }

  if (allowedHosts) {
    const list = allowedHosts.split(',').map((s) => s.trim()).filter(Boolean);
    if (list.length > 0) {
      return list.some((entry) => entry === hostname || hostname.endsWith('.' + entry));
    }
  }

  return true;
}

function validateUrlOrThrow(urlString, options = {}) {
  if (!isUrlAllowed(urlString, options)) {
    const err = new Error('URL not allowed');
    err.code = 'URL_NOT_ALLOWED';
    throw err;
  }
}

module.exports = {
  isUrlAllowed,
  validateUrlOrThrow,
  isHostIpPrivate,
};
