import { useState } from 'react';
import { X, Upload } from 'lucide-react';
import './HelpPage.scss';

interface Step {
  title: string;
  description: React.ReactNode;
  image?: string;
}

interface HelpPageProps {
  onUploadClick?: () => void;
  onPrivacyClick?: () => void;
}

function HelpPage({ onUploadClick, onPrivacyClick }: HelpPageProps) {
  const [modalImage, setModalImage] = useState<{ src: string; step: Step } | null>(null);

  const steps: Step[] = [
    {
      title: 'Go to your timetable page',
      description: 'NIE Portal > Academics > Programme Administration Matters > Timetable',
      image: '/guide/timetable page.png',
    },
    {
      title: 'Save the webpage',
      description: (
        <>
          Press <kbd>Ctrl</kbd>+<kbd>S</kbd> (or <kbd>Cmd</kbd>+<kbd>S</kbd> on Mac)
        </>
      ),
      image: '/guide/save as.png',
    },
    {
      title: 'Upload the file',
      description: (
        <>
          Click{' '}
          <button className="inline-upload-btn" onClick={onUploadClick}>
            <Upload size={14} /> Upload Timetable HTML
          </button>{' '}
          above and choose the file you downloaded
        </>
      ),
    },
    {
      title: 'Export your timetable',
      description:
        'Your timetable is autosaved. You can download an ICS file and add it to your Google, Outlook, or Apple Calendar.',
    },
  ];

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
      <ol className="steps">
        {steps.map((step, index) => (
          <li key={index}>
            <strong>{step.title}</strong>
            <p>{step.description}</p>
            {step.image && (
              <button
                className="step-thumbnail"
                onClick={() => setModalImage({ src: step.image!, step })}
              >
                <img src={step.image} alt={step.title} />
              </button>
            )}
          </li>
        ))}
      </ol>

      {modalImage && (
        <div className="image-modal-overlay">
          <div className="image-modal" onClick={(e) => e.stopPropagation()}>
            <button className="image-modal-close" onClick={() => setModalImage(null)}>
              <X size={24} />
            </button>
            <div className="image-modal-step">{modalImage.step.title}</div>
            <img src={modalImage.src} alt={modalImage.step.title} />
          </div>
        </div>
      )}
    </div>
  );
}

export default HelpPage;
