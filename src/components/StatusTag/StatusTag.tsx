import { REPORT_STATUS_LABELS, type ReportStatus } from '@/domain/report'
import { cx } from '@/lib/cx'
import styles from './StatusTag.module.css'

export type StatusTagProps = {
  status: ReportStatus
}

export function StatusTag({ status }: StatusTagProps) {
  return <span className={cx(styles.tag, styles[status])}>{REPORT_STATUS_LABELS[status]}</span>
}
