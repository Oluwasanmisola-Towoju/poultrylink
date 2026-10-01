import { useCallback, useEffect, useState } from 'react'
import { ListingsContext } from './listings'
import { api } from '../lib/api'

const normalize = (l) => ({
  ...l,
  product: l.productName,
  category: l.category?.name || 'Other',
  categoryId: l.categoryId,
  minOrder: Number(l.minOrderQuantity || 1),
  price: Number(l.price),
  quantity: Number(l.quantity),
  location: l.location || l.state || '',
  availableFrom: l.availabilityDate,
  images: (l.images || []).map((x) => typeof x === 'string' ? x : x.url),
  seller: l.seller?.profile?.businessName || [l.seller?.profile?.firstName, l.seller?.profile?.lastName].filter(Boolean).join(' ') || 'Seller',
  sellerId: l.sellerId || l.seller?.id,
  verification: String(l.seller?.verificationStatus || '').toLowerCase(),
})

export default function ListingsProvider({ children }) {
  const [listings, setListings] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    try {
      const [rows, cats] = await Promise.all([api.get('/listings/search?limit=100'), api.get('/listings/categories')])
      setListings((rows || []).map(normalize)); setCategories(cats || [])
    } finally { setLoading(false) }
  }, [])
  useEffect(() => { refresh().catch(console.error) }, [refresh])

  const addListing = async (data) => {
    const category = categories.find((c) => c.name === data.category) || categories[0]
    if (!category) throw new Error('No listing categories exist. Run the database seed.')
    const { listing } = await api.post('/listings', {
      categoryId: category.id, productName: data.product, description: data.description || undefined,
      quantity: Number(data.quantity), unit: data.unit, price: Number(data.price),
      minOrderQuantity: Number(data.minOrder || 1), location: data.location || undefined,
      availabilityDate: data.availableFrom ? new Date(data.availableFrom).toISOString() : undefined,
      images: data.images || [],
    })
    await refresh(); return listing.id
  }
  const removeListing = async (id) => { await api.delete(`/listings/${id}`); await refresh() }

  return <ListingsContext.Provider value={{ listings, categories, loading, addListing, removeListing, refresh }}>{children}</ListingsContext.Provider>
}
