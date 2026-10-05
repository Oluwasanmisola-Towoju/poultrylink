export function formatNaira(amount: string | number) {
  const n = typeof amount === "string" ? Number(amount) : amount;
  if (Number.isNaN(n)) return "—";
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n);
}

export function formatQuantity(qty: string | number, unit: string) {
  const n = typeof qty === "string" ? Number(qty) : qty;
  if (Number.isNaN(n)) return `— ${unit}`;
  return `${new Intl.NumberFormat("en-NG").format(n)} ${unit}`;
}

export function formatDate(value: string | Date) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}