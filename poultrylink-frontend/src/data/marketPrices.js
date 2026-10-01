// Mock price history. Later this comes from real order data.
// Each entry: { date: 'YYYY-MM-DD', price }
const week = (base, points) =>
  points.map((price, i) => ({
    date: new Date(Date.now() - (points.length - 1 - i) * 7 * 86400000)
      .toISOString()
      .slice(0, 10),
    price: Number((base + price).toFixed(2)),
  }))

export const MARKET_PRICES = [
  {
    id: 'broiler-live',
    product: 'Live broiler chicken',
    category: 'Live birds',
    unit: 'bird',
    locations: {
      Lagos: week(8, [0, 0.3, -0.2, 0.5]),
      Ibadan: week(7.4, [0, -0.1, 0.2, 0.1]),
      Abeokuta: week(7.6, [0, 0.2, 0.4, 0.6]),
    },
  },
  {
    id: 'eggs-crate',
    product: 'Table eggs',
    category: 'Eggs',
    unit: 'crate',
    locations: {
      Lagos: week(4.2, [0, -0.2, -0.3, -0.1]),
      Ibadan: week(3.9, [0, 0.1, 0, 0.2]),
      Kano: week(3.6, [0, 0.15, 0.1, 0.3]),
    },
  },
  {
    id: 'chicks-broiler',
    product: 'Day-old broiler chicks',
    category: 'Day-old chicks',
    unit: 'bird',
    locations: {
      Lagos: week(1.5, [0, 0, 0.1, 0]),
      Ibadan: week(1.4, [0, 0.05, 0.05, 0.1]),
    },
  },
  {
    id: 'feed-layers',
    product: 'Layers feed (25kg)',
    category: 'Feed',
    unit: 'bag',
    locations: {
      Lagos: week(18, [0, 0.5, 1, 0.8]),
      Ibadan: week(17.2, [0, 0.4, 0.6, 0.9]),
      Kano: week(16.8, [0, 0.3, 0.5, 0.7]),
    },
  },
]