import { statusBadge, statusLabelForBatch } from '@/lib/utils'

export default function StatusBadge({
  batch,
}: {
  batch: { status: string; expiry_date: string }
}) {
  return (
    <span className={`badge ${statusBadge(batch)}`}>{statusLabelForBatch(batch)}</span>
  )
}
