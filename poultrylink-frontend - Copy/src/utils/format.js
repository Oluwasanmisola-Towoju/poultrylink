// Change to 'NGN' when listings switch to naira
const CURRENCY = 'NGN'

export const formatPrice = (amount) =>
  new Intl.NumberFormat('en-NG', { style: 'currency', currency: CURRENCY }).format(amount)

export const formatQuantity = (qty, unit) =>
  unit === 'kg' ? `${qty} kg` : `${qty} ${unit}${qty === 1 ? '' : 's'}`

// Today's date as YYYY-MM-DD in the user's local time
export const todayISO = () => new Date().toLocaleDateString('en-CA')

export const formatAvailability = (iso) => {
  if (!iso || iso <= todayISO()) return 'Available now'
  const date = new Date(`${iso}T00:00:00`).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
  return `Available from ${date}`
}