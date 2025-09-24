const { URL } = require('url');
const net = require('net');

// Helper: check IPv4 private ranges
function isIPv4Private(ip) {
  if (net.isIP(ip) !== 4) return false;
  const parts = ip.split('.').map((p) => parseInt(p, 10));
  if (parts.length !== 4 || parts.some((n) => Number.isNaN(n))) return false;

  // 10.0.0.0/8
  if (parts[0] === 10) return true;
  // 172.16.0.0/12 (172.16.0.0 - 172.31.255.255)
  if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
  // 192.168.0.0/16
  if (parts[0] === 192 && parts[1] === 168) return true;
  // Loopback 127.0.0.0/8
  if (parts[0] === 127) return true;

  return false;
}

// Helper: basic IPv6 private checks
function isIPv6Private(ip) {
  if (net.isIP(ip) !== 6) return false;
  const lower = ip.toLowerCase();
  // IPv6 loopback
  if (lower === '::1') return true;
  // Unique local addresses (fc00::/7)
  if (lower.startsWith('fc') || lower.startsWith('fd')) return true;
  // Link-local (fe80::/10)
  if (lower.startsWith('fe80')) return true;
  return false;
}

function isHostIpPrivate(hostname) {
  // If hostname is already an IP, check ranges
  if (net.isIP(hostname)) {
    return isIPv4Private(hostname) || isIPv6Private(hostname);
  }
  return false;
}

/**
 * Check whether a URL should be allowed for outbound requests when the URL originates
 * from an untrusted source. This is intentionally conservative:
 * - Only http/https schemes are allowed
 * - IP addresses in private/reserved ranges are rejected
 * - If `allowedHosts` (string comma-separated) is provided (or via env ALLOWED_EXTERNAL_HOSTS),
 *   the hostname must match one of the allowed entries. An allowed entry may be a domain (example.com)
 *   or exact hostname. Subdomain matches are supported (host.endsWith('.example.com')).
 *
 * Options:
 *   { allowedHosts?: string, requireWhitelist?: boolean }
 */
function isUrlAllowed(urlString, options = {}) {
  const { allowedHosts = process.env.ALLOWED_EXTERNAL_HOSTS, requireWhitelist = false } = options;

  let parsed;
  try {
    parsed = new URL(urlString);
  } catch (err) {
    return false; // invalid URL
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) return false;

  const hostname = parsed.hostname;

  // Disallow private IPs
  if (isHostIpPrivate(hostname)) return false;

  // If a whitelist is required, enforce it
  if (requireWhitelist) {
    if (!allowedHosts) return false;
    const list = allowedHosts.split(',').map((s) => s.trim()).filter(Boolean);
    if (list.length === 0) return false;
    return list.some((entry) => entry === hostname || hostname.endsWith('.' + entry));
  }

  // If allowedHosts is provided (but whitelist not required), allow only if it matches
  if (allowedHosts) {
    const list = allowedHosts.split(',').map((s) => s.trim()).filter(Boolean);
    if (list.length > 0) {
      return list.some((entry) => entry === hostname || hostname.endsWith('.' + entry));
    }
  }

  // No whitelist configured and not an IP in private ranges: allow by default (non-blocking)
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
