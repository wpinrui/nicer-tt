import { Share2 } from 'lucide-react';

interface ShareWelcomeModalProps {
  onClose: () => void;
}

export function ShareWelcomeModal({ onClose }: ShareWelcomeModalProps) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="share-welcome-modal" onClick={(e) => e.stopPropagation()}>
        <div className="share-welcome-header">
          <Share2 size={32} className="share-welcome-icon" />
          <h3>Share Your Timetable Anywhere</h3>
        </div>
        <div className="share-welcome-content">
          <p>
            <strong>Click Share to copy a link to your clipboard.</strong> Anyone with the link can
            view your timetable without needing to upload the HTML file themselves.
          </p>
          <p>You can save this link to view your timetable from any device.</p>
          <p className="share-welcome-tip">
            <span className="tip-icon">📱</span>
            <span>
              <strong>Pro tip:</strong> Open the share link on your phone's browser once, and your
              timetable will be saved on your phone the next time you visit NIcEr Timetable.
            </span>
          </p>
        </div>
        <div className="share-welcome-actions">
          <button className="share-welcome-close" onClick={onClose}>
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
}
