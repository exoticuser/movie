/**
 * API Authentication utilities ported from a.py
 * Handles signature generation and authentication for MovieBox API
 */

import crypto from 'crypto';

// Configuration
export const BASE_URL = "https://api.inmoviebox.com";
export const PRIMARY_KEY = "76iRl07s0xSN9jqmEWAt79EBJZulIQIsV64FZr2O";

const ACCEPT = "application/json";
const CONTENT_TYPE = "application/json";
const UA = "com.community.mbox.in/50020042 (Linux; Android)";

const X_CLIENT_INFO = JSON.stringify({
  package_name: "com.community.mbox.in",
  version_name: "3.0.03.0529.03",
  version_code: 50020042,
  os: "android",
  os_version: "16",
  device_id: "da2b99c821e6ea023e4be55b54d5f7d8",
  install_store: "ps",
  brand: "google",
  model: "sdk_gphone64_x86_64",
  region: "IN",
  timezone: "Asia/Calcutta"
});

/**
 * Generate MD5 hex hash
 */
function md5Hex(data: string | Buffer): string {
  return crypto.createHash('md5').update(data).digest('hex');
}

/**
 * Generate X-Client-Token header
 */
function genXClientToken(ts: number): string {
  const tsStr = ts.toString();
  const reversedTs = tsStr.split('').reverse().join('');
  const hash = md5Hex(reversedTs);
  return `${ts},${hash}`;
}

/**
 * Build canonical request string for signature
 */
function buildCanonical(
  method: string,
  url: string,
  ts: number,
  body?: string
): string {
  const urlObj = new URL(url);
  const searchParams = new URLSearchParams(urlObj.search);
  
  // Sort query parameters
  const sortedParams: string[] = [];
  const keys = Array.from(searchParams.keys()).sort();
  for (const key of keys) {
    const values = searchParams.getAll(key);
    for (const value of values) {
      sortedParams.push(`${key}=${value}`);
    }
  }
  const query = sortedParams.join('&');

  let bodyLen = "";
  let bodyHash = "";
  
  if (body) {
    const bodyBytes = Buffer.from(body, 'utf-8');
    bodyLen = bodyBytes.length.toString();
    // Hash first 102400 bytes
    bodyHash = md5Hex(bodyBytes.slice(0, 102400));
  }

  return [
    method,
    ACCEPT,
    CONTENT_TYPE,
    bodyLen,
    ts.toString(),
    bodyHash,
    `${urlObj.pathname}?${query}`
  ].join('\n');
}

/**
 * Generate X-TR-Signature header
 */
function genXTrSignature(
  method: string,
  url: string,
  ts: number,
  body?: string
): string {
  const secret = Buffer.from(PRIMARY_KEY, 'base64');
  const canonical = buildCanonical(method, url, ts, body);
  const hmacDigest = crypto
    .createHmac('md5', secret)
    .update(canonical, 'utf-8')
    .digest();
  const sig = hmacDigest.toString('base64');
  return `${ts}|2|${sig}`;
}

/**
 * Generate all required headers for API request
 */
export function makeHeaders(
  method: string,
  url: string,
  body?: string
): Record<string, string> {
  const ts = Date.now();
  return {
    'user-agent': UA,
    'accept': ACCEPT,
    'content-type': CONTENT_TYPE,
    'x-client-info': X_CLIENT_INFO,
    'x-client-status': '0',
    'x-client-token': genXClientToken(ts),
    'x-tr-signature': genXTrSignature(method, url, ts, body),
  };
}
