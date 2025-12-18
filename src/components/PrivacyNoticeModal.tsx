import { Shield } from 'lucide-react';

interface PrivacyNoticeModalProps {
  onClose: () => void;
}

export function PrivacyNoticeModal({ onClose }: PrivacyNoticeModalProps) {
  return (
    <div className="modal-overlay">
      <div className="privacy-notice-modal" onClick={(e) => e.stopPropagation()}>
        <div className="privacy-notice-header">
          <Shield size={32} className="privacy-notice-icon" />
          <h3>Privacy & Security</h3>
        </div>
        <div className="privacy-notice-content">
          <section>
            <h4>What we extract from your HTML file</h4>
            <p>
              Only the timetable data: course codes, groups, times, dates, venues, and tutor names.
            </p>
          </section>

          <section>
            <h4>What we DON'T extract</h4>
            <p>
              Session tokens, cookies, authentication data, or any other sensitive information from
              the HTML file are ignored. We only parse the timetable table structure.
            </p>
          </section>

          <section>
            <h4>Client-side processing</h4>
            <p>
              All processing happens entirely in your browser. Your HTML file is never uploaded to
              any server.
            </p>
          </section>

          <section>
            <h4>Share links</h4>
            <p>
              When you use the Share feature, your timetable data (course codes, venues, tutor
              names, etc.) is encoded in the URL. Anyone with the link can view this data.
            </p>
          </section>

          <section>
            <h4>Local storage</h4>
            <p>
              Your timetable is saved in your browser's local storage so you can return without
              re-uploading.
            </p>
          </section>

          <section>
            <h4>Open source</h4>
            <p>
              This app is fully open-source. You can verify exactly how your data is handled by
              reviewing the code on{' '}
              <a
                href="https://github.com/wpinrui/nicer-tt"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub
              </a>
              .
            </p>
          </section>

          <div className="privacy-notice-warning">
            <span className="warning-icon">⚠️</span>
            <div>
              <strong>General advice:</strong> Be cautious when uploading saved HTML files from
              authenticated platforms to any web app. While this app only extracts timetable data
              and processes everything locally, other tools may not be as careful.
            </div>
          </div>
        </div>
        <div className="privacy-notice-actions">
          <button className="privacy-notice-close" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
