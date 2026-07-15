import styles from './StepProgress.module.scss';

interface StepProgressProps {
  current: number;
  total: number;
}

/** Segmented progress bar + "Step N of M" label, shared by the import wizard and the HelpPage stepper. */
export function StepProgress({ current, total }: StepProgressProps) {
  return (
    <>
      <div className={styles.dots}>
        {Array.from({ length: total }, (_, i) => {
          const n = i + 1;
          const cls = n < current ? styles.done : n === current ? styles.active : styles.idle;
          return <span key={n} className={`${styles.dot} ${cls}`} />;
        })}
      </div>
      <div className={styles.count}>
        Step {current} of {total}
      </div>
    </>
  );
}
