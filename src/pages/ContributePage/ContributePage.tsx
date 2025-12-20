import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Send, CheckCircle } from 'lucide-react';

import { submitSchedule } from '../../firebase';
import { FileUploadZone } from './FileUploadZone';
import styles from './ContributePage.module.scss';

export function ContributePage() {
  const [telegram, setTelegram] = useState('');
  const [courseName, setCourseName] = useState('');
  const [notes, setNotes] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isValid = courseName.trim() && (files.length > 0 || notes.trim());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const id = await submitSchedule({
        telegram: telegram.trim() || undefined,
        courseName: courseName.trim(),
        notes: notes.trim() || undefined,
        files,
      });
      setSubmissionId(id);
    } catch (err) {
      console.error('Submission failed:', err);
      setError('Failed to submit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submissionId) {
    return (
      <div className={styles.container}>
        <div className={styles.successContainer}>
          <CheckCircle className={styles.successIcon} size={48} />
          <h2>Thank you!</h2>
          <p>Your schedule has been submitted successfully.</p>
          <p className={styles.submissionId}>Reference: {submissionId}</p>
          <Link to="/" className={styles.backButton}>
            <ArrowLeft size={16} />
            Back to Timetable
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Link to="/" className={styles.backLink}>
          <ArrowLeft size={20} />
        </Link>
        <h1>Contribute Schedule</h1>
      </header>

      <p className={styles.description}>
        Help others by sharing your content upgrading schedule. Upload your timetable HTML, PDF, or
        screenshot.
      </p>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.field}>
          <label htmlFor="courseName">
            Course Name <span className={styles.required}>*</span>
          </label>
          <input
            id="courseName"
            type="text"
            value={courseName}
            onChange={(e) => setCourseName(e.target.value)}
            placeholder="e.g., COM1234 - Computing for Educators"
            required
          />
        </div>

        <div className={styles.field}>
          <label>Schedule File</label>
          <FileUploadZone files={files} onChange={setFiles} />
        </div>

        <div className={styles.field}>
          <label htmlFor="notes">Notes</label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any additional information..."
            rows={3}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="telegram">Telegram Handle (Optional)</label>
          <input
            id="telegram"
            type="text"
            value={telegram}
            onChange={(e) => setTelegram(e.target.value)}
            placeholder="@username"
          />
          <span className={styles.hint}>For follow-up questions only</span>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <button type="submit" disabled={!isValid || isSubmitting} className={styles.submitButton}>
          {isSubmitting ? (
            'Submitting...'
          ) : (
            <>
              <Send size={16} />
              Submit Schedule
            </>
          )}
        </button>
      </form>
    </div>
  );
}

export default ContributePage;
