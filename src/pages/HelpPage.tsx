import './HelpPage.scss';

import { Upload } from 'lucide-react';
import { useState } from 'react';

import { LaunchpadStepBody, SavePageStepBody, StepProgress } from '../components/nieImportSteps';

interface HelpPageProps {
  onUploadClick?: () => void;
  onPrivacyClick?: () => void;
}

const TOTAL_STEPS = 3;

/**
 * Start-page walkthrough for brand-new users (no timetable yet). Adopts the
 * import wizard's step-by-step layout (progress bar + Back/Next) but rendered
 * inline in the page, not as a modal. Ends at the first upload.
 */
function HelpPage({ onUploadClick, onPrivacyClick }: HelpPageProps) {
  const [step, setStep] = useState(1);

  return (
    <div className="help-page">
      {onPrivacyClick && (
        <div className="privacy-banner">
          🔒 This app does not collect your data. Learn more here:{' '}
          <button className="privacy-banner-link" onClick={onPrivacyClick}>
            Privacy Notice
          </button>
        </div>
      )}

      <div className="inline-wizard">
        <div className="iw-head">
          <div className="iw-eyebrow">Set up your timetable</div>
          <h3 className="iw-title">
            {step === 1 && 'Open your timetable on NIE Launchpad'}
            {step === 2 && 'Save the page as a file'}
            {step === 3 && 'Upload it here'}
          </h3>
          <StepProgress current={step} total={TOTAL_STEPS} />
        </div>

        <div className="iw-body">
          {step === 1 && <LaunchpadStepBody compact />}
          {step === 2 && <SavePageStepBody compact />}
          {step === 3 && (
            <>
              <p className="iw-lead">
                Upload the <strong>.html</strong> file you just saved and your timetable appears
                right away.
              </p>
              <button className="iw-upload" onClick={onUploadClick}>
                <Upload size={16} /> Upload Timetable HTML
              </button>
              <p className="iw-note">
                Your file is read right here in your browser. Nothing is uploaded to any server.
              </p>
            </>
          )}
        </div>

        <div className="iw-foot">
          {step === 1 && (
            <>
              <span className="iw-grow" />
              <button className="iw-btn-primary" onClick={() => setStep(2)}>
                Next
              </button>
            </>
          )}
          {step === 2 && (
            <>
              <button className="iw-btn-ghost" onClick={() => setStep(1)}>
                Back
              </button>
              <span className="iw-grow" />
              <button className="iw-btn-primary" onClick={() => setStep(3)}>
                Next
              </button>
            </>
          )}
          {step === 3 && (
            <>
              <button className="iw-btn-ghost" onClick={() => setStep(2)}>
                Back
              </button>
              <span className="iw-grow" />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default HelpPage;
