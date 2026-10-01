import { STATUS_LABEL, STATUS_TONE } from '../utils/orders'

export default function StatusBadge({ status }) {
  return <span className={`badge badge-${STATUS_TONE[status]}`}>{STATUS_LABEL[status]}</span>
}