import styles from './NieProcedureSteps.module.scss';
import { ScreenshotGrid, type Shot } from './ScreenshotGrid';

const LAUNCHPAD_URL = 'https://launchpad.nie.edu.sg/student/overview';

const STEP1_SHOTS: Shot[] = [
  { src: '/guide/launchpad search.png', cap: 'Search "timetable"', sub: 'and the Service result' },
  { src: '/guide/timetable loading.png', cap: 'Opens in a new tab', sub: 'signing you in' },
];

const STEP2_SHOTS: Shot[] = [
  { src: '/guide/timetable page.png', cap: 'Your timetable', sub: 'the page you save' },
  { src: '/guide/save as.png', cap: 'Save as', sub: 'Webpage, HTML Only' },
];

interface StepBodyProps {
  /** Smaller screenshot thumbnails, for the space-constrained inline HelpPage stepper. */
  compact?: boolean;
}

/** Step-1 body (find your timetable on NIE Launchpad). Shared by the wizard and HelpPage stepper. */
export function LaunchpadStepBody({ compact = false }: StepBodyProps = {}) {
  return (
    <>
      <p className={styles.lead}>
        NIE recently changed where your timetable lives. Here's the new way to find it:
      </p>
      <ol className={styles.substeps}>
        <li>
          Go to{' '}
          <a className={styles.link} href={LAUNCHPAD_URL} target="_blank" rel="noopener noreferrer">
            launchpad.nie.edu.sg
          </a>{' '}
          and sign in.
        </li>
        <li>
          In the <span className={styles.strong}>search box</span> (top-right), type{' '}
          <span className={styles.strong}>"timetable"</span>.
        </li>
        <li>
          Open the first result tagged <span className={styles.pillTag}>Service</span>:{' '}
          <span className={styles.strong}>ISAAC Student Timetable</span>. It opens in a new tab.
        </li>
      </ol>
      <ScreenshotGrid shots={STEP1_SHOTS} compact={compact} />
    </>
  );
}

/** Step-2 body (save the loaded page as HTML). Shared by the wizard and HelpPage stepper. */
export function SavePageStepBody({ compact = false }: StepBodyProps = {}) {
  return (
    <>
      <p className={styles.lead}>
        Once your timetable has loaded in the new tab, save it to your device:
      </p>
      <ol className={styles.substeps}>
        <li>
          Press <kbd>Ctrl</kbd>+<kbd>S</kbd> (or <kbd>Cmd</kbd>+<kbd>S</kbd> on Mac).
        </li>
        <li>
          If asked, choose <span className={styles.strong}>"Webpage, HTML Only"</span> and save.
          Remember where it goes (usually your <span className={styles.strong}>Downloads</span>{' '}
          folder).
        </li>
      </ol>
      <ScreenshotGrid shots={STEP2_SHOTS} compact={compact} />
    </>
  );
}
