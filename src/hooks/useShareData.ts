import { useState, useEffect, useCallback } from 'react';
import type { TimetableEvent, Timetable } from '../types';
import { encodeShareData, type ShareData } from '../utils/shareUtils';
import { getShareDataFromUrl, createShareUrl, clearShareHash } from '../utils/shareUrl';
import { TOAST_DURATION_MS } from '../utils/constants';
import { logError } from '../utils/errors';

interface MatchedTimetable {
  id: string;
  name: string;
}

interface ShareLinkFallback {
  url: string;
  name: string;
}

/**
 * Manages share link creation and incoming share data handling.
 *
 * Share Flow States:
 * 1. No share data → Normal operation
 * 2. Share data matches existing timetable → Auto-switch (matchedTimetable set)
 * 3. Share data + no existing data → Auto-add (pendingShareData, no modal)
 * 4. Share data + existing data → Show modal (pendingShareData + showShareModal)
 * 5. User viewing temp → tempViewData set
 *
 * @param hasExistingData - Whether user has any timetable data
 * @param timetables - Array of user's timetables for matching
 */
export function useShareData(hasExistingData: boolean, timetables: Timetable[]) {
  const [pendingShareData, setPendingShareData] = useState<ShareData | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareMessage, setShareMessage] = useState<string | null>(null);
  const [tempViewData, setTempViewData] = useState<ShareData | null>(null);
  const [matchedTimetable, setMatchedTimetable] = useState<MatchedTimetable | null>(null);
  const [shareLinkFallback, setShareLinkFallback] = useState<ShareLinkFallback | null>(null);

  /**
   * Checks if events match any existing timetable.
   * Uses JSON comparison for deep equality.
   */
  const findMatchingTimetable = useCallback(
    (events: TimetableEvent[]): MatchedTimetable | null => {
      const eventsStr = JSON.stringify(events);
      for (const tt of timetables) {
        if (JSON.stringify(tt.events) === eventsStr) {
          return { id: tt.id, name: tt.name };
        }
      }
      return null;
    },
    [timetables]
  );

  // Handle share data from URL on mount and hash changes
  useEffect(() => {
    const processShareHash = () => {
      const decoded = getShareDataFromUrl();
      if (!decoded) return;

      clearShareHash();

      // Check if shared data matches any existing timetable
      const match = findMatchingTimetable(decoded.events);

      if (match) {
        // Found a match - consumer will auto-switch
        setMatchedTimetable(match);
        setPendingShareData(null);
      } else if (hasExistingData) {
        // No match, but user has data - show modal
        setPendingShareData(decoded);
        setShowShareModal(true);
        setMatchedTimetable(null);
      } else {
        // No match, no existing data - consumer will auto-add
        setPendingShareData(decoded);
        setMatchedTimetable(null);
      }
    };

    processShareHash();

    window.addEventListener('hashchange', processShareHash);
    return () => window.removeEventListener('hashchange', processShareHash);
  }, [hasExistingData, findMatchingTimetable]);

  /**
   * Creates a share link and copies to clipboard.
   * Falls back to showing URL in modal if clipboard fails.
   */
  const createShareLink = useCallback(
    async (events: TimetableEvent[], timetableName: string) => {
      const encoded = encodeShareData(events, timetableName);
      const shareUrl = createShareUrl(encoded);

      try {
        await navigator.clipboard.writeText(shareUrl);
        setShareMessage(`Share link for "${timetableName}" copied!`);
        setTimeout(() => setShareMessage(null), TOAST_DURATION_MS);
      } catch (e) {
        logError('useShareData:clipboard', e);
        setShareLinkFallback({ url: shareUrl, name: timetableName });
      }
    },
    []
  );

  /** User confirmed adding shared timetable */
  const confirmShare = useCallback(() => {
    setShowShareModal(false);
    const data = pendingShareData;
    setPendingShareData(null);
    return data;
  }, [pendingShareData]);

  /** User chose to view shared timetable temporarily */
  const viewTempShare = useCallback(() => {
    setShowShareModal(false);
    if (pendingShareData) {
      setTempViewData(pendingShareData);
    }
    setPendingShareData(null);
  }, [pendingShareData]);

  /** Exit temporary view mode */
  const exitTempView = useCallback(() => {
    setTempViewData(null);
  }, []);

  /** User cancelled the share modal */
  const cancelShare = useCallback(() => {
    setShowShareModal(false);
    setPendingShareData(null);
  }, []);

  /**
   * Gets pending share data for auto-add scenario.
   * Only returns data when modal is not shown (no existing data case).
   */
  const getImmediateShareData = useCallback(() => {
    if (pendingShareData && !showShareModal) {
      const data = pendingShareData;
      setPendingShareData(null);
      return data;
    }
    return null;
  }, [pendingShareData, showShareModal]);

  const clearShareLinkFallback = useCallback(() => {
    setShareLinkFallback(null);
  }, []);

  const clearMatchedTimetable = useCallback(() => {
    setMatchedTimetable(null);
  }, []);

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
