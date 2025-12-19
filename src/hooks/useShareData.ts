import { useState, useEffect, useCallback } from 'react';
import type { TimetableEvent, Timetable } from '../types';
import { encodeShareData, decodeShareData, type ShareData } from '../utils/shareUtils';
import { TOAST_DURATION_MS } from '../utils/constants';
import { logError } from '../utils/errors';

interface MatchedTimetable {
  id: string;
  name: string;
}

export function useShareData(
  hasExistingData: boolean,
  timetables: Timetable[]
) {
  const [pendingShareData, setPendingShareData] = useState<ShareData | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareMessage, setShareMessage] = useState<string | null>(null);
  const [tempViewData, setTempViewData] = useState<ShareData | null>(null);
  const [matchedTimetable, setMatchedTimetable] = useState<MatchedTimetable | null>(null);
  const [shareLinkFallback, setShareLinkFallback] = useState<{ url: string; name: string } | null>(null);

  // Check if events match any existing timetable
  const findMatchingTimetable = useCallback((events: TimetableEvent[]): MatchedTimetable | null => {
    const eventsStr = JSON.stringify(events);
    for (const tt of timetables) {
      if (JSON.stringify(tt.events) === eventsStr) {
        return { id: tt.id, name: tt.name };
      }
    }
    return null;
  }, [timetables]);

  // Check for shared data in URL on mount and hash changes
  useEffect(() => {
    const handleShareHash = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#share=')) {
        const encoded = hash.slice(7);
        const decoded = decodeShareData(encoded);
        if (decoded) {
          // Check if shared data matches any existing timetable
          const match = findMatchingTimetable(decoded.events);

          if (match) {
            // Found a match - will auto-switch
            setMatchedTimetable(match);
            setPendingShareData(null);
          } else if (hasExistingData) {
            // No match, but user has data - show modal
            setPendingShareData(decoded);
            setShowShareModal(true);
            setMatchedTimetable(null);
          } else {
            // No match, no existing data - will auto-add
            setPendingShareData(decoded);
            setMatchedTimetable(null);
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
  }, [hasExistingData, findMatchingTimetable]);

  const createShareLink = useCallback(async (events: TimetableEvent[], timetableName: string) => {
    const encoded = encodeShareData(events, timetableName);
    const shareUrl = `${window.location.origin}${window.location.pathname}#share=${encoded}`;

    try {
      await navigator.clipboard.writeText(shareUrl);
      setShareMessage(`Share link for "${timetableName}" copied!`);
      setTimeout(() => setShareMessage(null), TOAST_DURATION_MS);
    } catch (e) {
      // Clipboard failed - show fallback modal (expected in some browsers/contexts)
      logError('useShareData:clipboard', e);
      setShareLinkFallback({ url: shareUrl, name: timetableName });
    }
  }, []);

  const clearShareLinkFallback = useCallback(() => {
    setShareLinkFallback(null);
  }, []);

  const clearMatchedTimetable = useCallback(() => {
    setMatchedTimetable(null);
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
    matchedTimetable,
    shareLinkFallback,
    createShareLink,
    confirmShare,
    viewTempShare,
    exitTempView,
    cancelShare,
    getImmediateShareData,
    clearMatchedTimetable,
    clearShareLinkFallback,
  };
}
