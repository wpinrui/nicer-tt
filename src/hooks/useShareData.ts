import { useState, useEffect, useCallback } from 'react';
import type { TimetableEvent } from '../utils/parseHtml';
import { encodeShareData, decodeShareData, type ShareData } from '../utils/shareUtils';

export function useShareData(hasExistingData: boolean, currentEvents?: TimetableEvent[] | null) {
  const [pendingShareData, setPendingShareData] = useState<ShareData | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareMessage, setShareMessage] = useState<string | null>(null);
  const [tempViewData, setTempViewData] = useState<ShareData | null>(null);

  // Check for shared data in URL on mount and hash changes
  useEffect(() => {
    const handleShareHash = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#share=')) {
        const encoded = hash.slice(7);
        const decoded = decodeShareData(encoded);
        if (decoded) {
          // Check if shared data is same as current data
          const isSameData = currentEvents &&
            JSON.stringify(decoded.events) === JSON.stringify(currentEvents);

          if (isSameData) {
            // Same data, just clear the hash without showing dialog
            window.history.replaceState(null, '', window.location.pathname);
            return;
          }

          if (hasExistingData) {
            setPendingShareData(decoded);
            setShowShareModal(true);
          } else {
            setPendingShareData(decoded);
          }
          window.history.replaceState(null, '', window.location.pathname);
        }
      }
    };

    // Check on mount
    handleShareHash();

    // Listen for hash changes (when user pastes link while on page)
    window.addEventListener('hashchange', handleShareHash);
    return () => window.removeEventListener('hashchange', handleShareHash);
  }, [hasExistingData, currentEvents]);

  const createShareLink = useCallback(async (events: TimetableEvent[], fileName: string) => {
    const encoded = encodeShareData(events, fileName);
    const shareUrl = `${window.location.origin}${window.location.pathname}#share=${encoded}`;

    try {
      await navigator.clipboard.writeText(shareUrl);
      setShareMessage('Share link for My Timetable copied!');
      setTimeout(() => setShareMessage(null), 3000);
    } catch {
      prompt('Copy this link to share My Timetable:', shareUrl);
    }
  }, []);

  const confirmShare = useCallback(() => {
    setShowShareModal(false);
    const data = pendingShareData;
    setPendingShareData(null);
    return data;
  }, [pendingShareData]);

  const viewTempShare = useCallback(() => {
    setShowShareModal(false);
    if (pendingShareData) {
      setTempViewData(pendingShareData);
    }
    setPendingShareData(null);
  }, [pendingShareData]);

  const exitTempView = useCallback(() => {
    setTempViewData(null);
  }, []);

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
    tempViewData,
    createShareLink,
    confirmShare,
    viewTempShare,
    exitTempView,
    cancelShare,
    getImmediateShareData,
  };
}
