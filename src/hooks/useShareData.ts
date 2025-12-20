import { useCallback, useEffect, useState } from 'react';

import type { CustomEvent, ShareData, Timetable, TimetableEvent } from '../types';
import { TOAST_DURATION_MS } from '../utils/constants';
import { logError } from '../utils/errors';
import { clearShareHash, createShareUrl, getShareDataFromUrl } from '../utils/shareUrl';
import { encodeShareData } from '../utils/shareUtils';

interface MatchedTimetable {
  id: string;
  name: string;
}

interface ManualShareModal {
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
 * 4. Share data + existing data → Show modal (pendingShareData + isShareModalOpen)
 * 5. User viewing temp → previewData set
 *
 * @param hasExistingData - Whether user has any timetable data
 * @param timetables - Array of user's timetables for matching
 */
export function useShareData(hasExistingData: boolean, timetables: Timetable[]) {
  const [pendingShareData, setPendingShareData] = useState<ShareData | null>(null);
  const [isShareModalOpen, setShareModalOpen] = useState(false);
  const [shareMessage, setShareMessage] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<ShareData | null>(null);
  const [matchedTimetable, setMatchedTimetable] = useState<MatchedTimetable | null>(null);
  const [manualShareModal, setManualShareModal] = useState<ManualShareModal | null>(null);

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

  /**
   * Processes share data from URL hash.
   * Wrapped in useCallback for stable reference in event listener.
   */
  const processShareHash = useCallback(() => {
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
      setShareModalOpen(true);
      setMatchedTimetable(null);
    } else {
      // No match, no existing data - consumer will auto-add
      setPendingShareData(decoded);
      setMatchedTimetable(null);
    }
  }, [hasExistingData, findMatchingTimetable]);

  // Handle share data from URL on mount and hash changes
  useEffect(() => {
    // Defer initial processing to avoid synchronous setState in effect body
    const timeoutId = setTimeout(processShareHash, 0);

    window.addEventListener('hashchange', processShareHash);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('hashchange', processShareHash);
    };
  }, [processShareHash]);

  /**
   * Creates a share link and copies to clipboard.
   * Falls back to showing URL in modal if clipboard fails.
   * @param customEvents - Optional custom events to include in share (V2 format)
   */
  const createShareLink = useCallback(
    async (events: TimetableEvent[], timetableName: string, customEvents?: CustomEvent[]) => {
      const encoded = encodeShareData(events, timetableName, customEvents);
      const shareUrl = createShareUrl(encoded);

      try {
        await navigator.clipboard.writeText(shareUrl);
        setShareMessage(`Share link for "${timetableName}" copied!`);
        setTimeout(() => setShareMessage(null), TOAST_DURATION_MS);
      } catch (e) {
        logError('useShareData:clipboard', e);
        setManualShareModal({ url: shareUrl, name: timetableName });
      }
    },
    []
  );

  /** User confirmed adding shared timetable */
  const confirmShare = useCallback(() => {
    setShareModalOpen(false);
    const data = pendingShareData;
    setPendingShareData(null);
    return data;
  }, [pendingShareData]);

  /** User chose to view shared timetable temporarily */
  const viewTempShare = useCallback(() => {
    setShareModalOpen(false);
    if (pendingShareData) {
      setPreviewData(pendingShareData);
    }
    setPendingShareData(null);
  }, [pendingShareData]);

  /** Exit temporary view mode */
  const exitTempView = useCallback(() => {
    setPreviewData(null);
  }, []);

  /** User cancelled the share modal */
  const cancelShare = useCallback(() => {
    setShareModalOpen(false);
    setPendingShareData(null);
  }, []);

  /**
   * Gets pending share data for auto-add scenario.
   * Only returns data when modal is not shown (no existing data case).
   */
  const getImmediateShareData = useCallback(() => {
    if (pendingShareData && !isShareModalOpen) {
      const data = pendingShareData;
      setPendingShareData(null);
      return data;
    }
    return null;
  }, [pendingShareData, isShareModalOpen]);

  const clearManualShareModal = useCallback(() => {
    setManualShareModal(null);
  }, []);

  const clearMatchedTimetable = useCallback(() => {
    setMatchedTimetable(null);
  }, []);

  return {
    pendingShareData,
    isShareModalOpen,
    shareMessage,
    previewData,
    matchedTimetable,
    manualShareModal,
    createShareLink,
    confirmShare,
    viewTempShare,
    exitTempView,
    cancelShare,
    getImmediateShareData,
    clearMatchedTimetable,
    clearManualShareModal,
  };
}
