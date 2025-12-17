import { useState, useEffect, useCallback } from 'react';
import pako from 'pako';
import type { TimetableEvent } from '../utils/parseHtml';

interface ShareData {
  events: TimetableEvent[];
  fileName: string;
}

// URL-safe base64 encoding
function toUrlSafeBase64(bytes: Uint8Array): string {
  const binary = String.fromCharCode(...bytes);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromUrlSafeBase64(str: string): Uint8Array {
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

function encodeShareData(events: TimetableEvent[], fileName: string): string {
  const data = JSON.stringify({ events, fileName });
  const compressed = pako.deflate(data);
  return toUrlSafeBase64(compressed);
}

function decodeShareData(encoded: string): ShareData | null {
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

export function useShareData(hasExistingData: boolean) {
  const [pendingShareData, setPendingShareData] = useState<ShareData | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareMessage, setShareMessage] = useState<string | null>(null);

  // Check for shared data in URL on mount
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.startsWith('#share=')) {
      const encoded = hash.slice(7);
      const decoded = decodeShareData(encoded);
      if (decoded) {
        if (hasExistingData) {
          setPendingShareData(decoded);
          setShowShareModal(true);
        } else {
          setPendingShareData(decoded);
        }
        window.history.replaceState(null, '', window.location.pathname);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const createShareLink = useCallback(async (events: TimetableEvent[], fileName: string) => {
    const encoded = encodeShareData(events, fileName);
    const shareUrl = `${window.location.origin}${window.location.pathname}#share=${encoded}`;

    try {
      await navigator.clipboard.writeText(shareUrl);
      setShareMessage('Link copied to clipboard!');
      setTimeout(() => setShareMessage(null), 3000);
    } catch {
      prompt('Copy this link to share your timetable:', shareUrl);
    }
  }, []);

  const confirmShare = useCallback(() => {
    setShowShareModal(false);
    const data = pendingShareData;
    setPendingShareData(null);
    return data;
  }, [pendingShareData]);

  const cancelShare = useCallback(() => {
    setShowShareModal(false);
    setPendingShareData(null);
  }, []);

  const getImmediateShareData = useCallback(() => {
    if (pendingShareData && !showShareModal) {
      const data = pendingShareData;
      setPendingShareData(null);
      return data;
    }
    return null;
  }, [pendingShareData, showShareModal]);

  return {
    pendingShareData,
    showShareModal,
    shareMessage,
    createShareLink,
    confirmShare,
    cancelShare,
    getImmediateShareData,
  };
}
