import { useState, useEffect, useCallback } from 'react';
import type { TimetableEvent } from '../utils/parseHtml';

interface ShareData {
  events: TimetableEvent[];
  fileName: string;
}

function encodeShareData(events: TimetableEvent[], fileName: string): string {
  const data = JSON.stringify({ events, fileName });
  return btoa(encodeURIComponent(data));
}

function decodeShareData(encoded: string): ShareData | null {
  try {
    const data = decodeURIComponent(atob(encoded));
    return JSON.parse(data);
  } catch {
    return null;
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
