import pako from 'pako';
import type { TimetableEvent } from './parseHtml';

export interface ShareData {
  events: TimetableEvent[];
  fileName: string;
}

// URL-safe base64 encoding
export function toUrlSafeBase64(bytes: Uint8Array): string {
  const binary = String.fromCharCode(...bytes);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function fromUrlSafeBase64(str: string): Uint8Array {
  // Restore standard base64
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  // Add padding if needed
  while (base64.length % 4) base64 += '=';
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export function encodeShareData(events: TimetableEvent[], fileName: string): string {
  const data = JSON.stringify({ events, fileName });
  const compressed = pako.deflate(data);
  return toUrlSafeBase64(compressed);
}

export function decodeShareData(encoded: string): ShareData | null {
  // Try compressed format first (new)
  try {
    const bytes = fromUrlSafeBase64(encoded);
    const decompressed = pako.inflate(bytes, { to: 'string' });
    return JSON.parse(decompressed);
  } catch {
    // Fall back to legacy uncompressed format
    try {
      const data = decodeURIComponent(atob(encoded));
      return JSON.parse(data);
    } catch {
      return null;
    }
  }
}

// Helper to decode a full share URL (extracts the hash and decodes)
export function decodeShareUrl(url: string): ShareData | null {
  const hashIndex = url.indexOf('#share=');
  if (hashIndex === -1) return null;
  const encoded = url.substring(hashIndex + 7);
  return decodeShareData(encoded);
}
