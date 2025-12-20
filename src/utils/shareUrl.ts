import { decodeShareData, type ShareData } from './shareUtils';

const SHARE_HASH_PREFIX = '#share=';

/**
 * Extracts and decodes share data from the current URL hash.
 * Returns null if no share data is present or decoding fails.
 */
export function getShareDataFromUrl(): ShareData | null {
  const hash = window.location.hash;
  if (!hash.startsWith(SHARE_HASH_PREFIX)) {
    return null;
  }
  const encoded = hash.slice(SHARE_HASH_PREFIX.length);
  return decodeShareData(encoded);
}

/**
 * Creates a full share URL for the given timetable.
 * @param encoded - The encoded share data string
 */
export function createShareUrl(encoded: string): string {
  return `${window.location.origin}${window.location.pathname}${SHARE_HASH_PREFIX}${encoded}`;
}

/**
 * Clears the share hash from the URL without navigation.
 */
export function clearShareHash(): void {
  window.history.replaceState(null, '', window.location.pathname);
}
