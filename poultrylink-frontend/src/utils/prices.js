export const latest = (series) => series[series.length - 1].price
export const previous = (series) => (series.length > 1 ? series[series.length - 2].price : null)

// Percent change from the previous point to the latest one
export const change = (series) => {
  const prev = previous(series)
  if (prev == null) return null
  return ((latest(series) - prev) / prev) * 100
}

export const allLocations = (entry) => Object.keys(entry.locations)