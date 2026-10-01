// Default commission rate. The admin can change the live rate in Settings.
export const COMMISSION_RATE = 0.05

export const STATUS = {
  PLACED: 'placed',
  ACCEPTED: 'accepted',
  IN_ESCROW: 'in_escrow',
  IN_DELIVERY: 'in_delivery',
  COMPLETED: 'completed',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled',
  DISPUTED: 'disputed',
  REFUNDED: 'refunded',
}

export const STATUS_LABEL = {
  placed: 'Awaiting seller',
  accepted: 'Awaiting payment',
  in_escrow: 'In escrow',
  in_delivery: 'In delivery',
  completed: 'Completed',
  rejected: 'Declined',
  cancelled: 'Cancelled',
  disputed: 'In dispute',
  refunded: 'Refunded',
}

export const STATUS_TONE = {
  placed: 'wait',
  accepted: 'wait',
  in_escrow: 'go',
  in_delivery: 'go',
  completed: 'done',
  rejected: 'bad',
  cancelled: 'bad',
  disputed: 'bad',
  refunded: 'bad',
}

// Statuses where the buyer's money is still held by the platform
export const HELD_STATUSES = [STATUS.IN_ESCROW, STATUS.IN_DELIVERY, STATUS.DISPUTED]

// The normal path an order follows, in order
export const STEPS = [
  { status: STATUS.PLACED, label: 'Order placed' },
  { status: STATUS.ACCEPTED, label: 'Accepted by the seller' },
  { status: STATUS.IN_ESCROW, label: 'Paid, money held in escrow' },
  { status: STATUS.IN_DELIVERY, label: 'Out for delivery' },
  { status: STATUS.COMPLETED, label: 'Delivery confirmed, funds released' },
]

export const orderTotals = (order) => {
  const rate = order.commissionRate ?? COMMISSION_RATE
  const total = order.price * order.quantity
  const commission = total * rate
  return { total, commission, payout: total - commission, rate }
}