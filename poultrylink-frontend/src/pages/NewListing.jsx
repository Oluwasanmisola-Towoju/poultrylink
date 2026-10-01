import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/auth'
import { useListings } from '../context/listings'
import { CATEGORIES, UNITS } from '../data/listings'
import { todayISO } from '../utils/format'

const MAX_IMAGES = 3

function Field({ label, error, children }) {
  return (
    <label>
      {label}
      {children}
      {error && <span className="error">{error}</span>}
    </label>
  )
}

export default function NewListing() {
  const { user } = useAuth()
  const { addListing } = useListings()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    product: '',
    category: CATEGORIES[0],
    unit: UNITS[0],
    quantity: '',
    minOrder: '1',
    price: '',
    availableFrom: todayISO(),
    location: '',
    farm: '',
    description: '',
  })
  const [images, setImages] = useState([])
  const [errors, setErrors] = useState({})

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  // Photos are only previewed for now; real uploads need the backend
  const handleImages = (e) => {
    const picked = Array.from(e.target.files).map((file) => URL.createObjectURL(file))
    setImages((prev) => [...prev, ...picked].slice(0, MAX_IMAGES))
    e.target.value = ''
  }
  const removeImage = (url) => setImages((prev) => prev.filter((u) => u !== url))

  const validate = () => {
    const errs = {}
    const qty = Number(form.quantity)
    const min = Number(form.minOrder)
    if (!form.product.trim()) errs.product = 'Enter the product.'
    if (!(Number.isInteger(qty) && qty > 0)) errs.quantity = 'Enter a whole number above 0.'
    if (!(Number(form.price) > 0)) errs.price = 'Enter a price above 0.'
    if (!(Number.isInteger(min) && min > 0)) errs.minOrder = 'Enter a whole number above 0.'
    else if (min > qty) errs.minOrder = 'Cannot be more than the quantity available.'
    if (!form.location.trim()) errs.location = 'Enter where the item is.'
    if (!form.availableFrom) errs.availableFrom = 'Choose a date.'
    return errs
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = validate()
    setErrors(errs)
    if (Object.keys(errs).length > 0) return

    const id = addListing({
      product: form.product.trim(),
      category: form.category,
      quantity: Number(form.quantity),
      unit: form.unit,
      price: Number(form.price),
      minOrder: Number(form.minOrder),
      location: form.location.trim(),
      availableFrom: form.availableFrom,
      description: form.description.trim(),
      images,
      farm: form.farm.trim(),
      seller: user.name,
      verification: 'unverified',
    })
    navigate(`/marketplace/${id}`)
  }

  return (
    <>
      <Link to="/farmer" className="back">Back to my listings</Link>
      <h1>Post a listing</h1>

      <form onSubmit={handleSubmit} className="stack form" noValidate>
        <Field label="Product" error={errors.product}>
          <input
            value={form.product}
            onChange={set('product')}
            aria-invalid={!!errors.product}
            placeholder="e.g. Broilers, ready for sale"
          />
        </Field>

        <div className="row">
          <Field label="Category">
            <select value={form.category} onChange={set('category')}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </Field>
          <Field label="Sold per">
            <select value={form.unit} onChange={set('unit')}>
              {UNITS.map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </Field>
        </div>

        <div className="row">
          <Field label="Quantity available" error={errors.quantity}>
            <input
              type="number"
              min="1"
              value={form.quantity}
              onChange={set('quantity')}
              aria-invalid={!!errors.quantity}
            />
          </Field>
          <Field label="Minimum order quantity" error={errors.minOrder}>
            <input
              type="number"
              min="1"
              value={form.minOrder}
              onChange={set('minOrder')}
              aria-invalid={!!errors.minOrder}
            />
          </Field>
        </div>

        <div className="row">
          <Field label={`Price per ${form.unit}`} error={errors.price}>
            <input
              type="number"
              min="0"
              step="any"
              value={form.price}
              onChange={set('price')}
              aria-invalid={!!errors.price}
            />
          </Field>
          <Field label="Available from" error={errors.availableFrom}>
            <input
              type="date"
              value={form.availableFrom}
              onChange={set('availableFrom')}
              aria-invalid={!!errors.availableFrom}
            />
          </Field>
        </div>

        <div className="row">
          <Field label="Location" error={errors.location}>
            <input
              value={form.location}
              onChange={set('location')}
              aria-invalid={!!errors.location}
              placeholder="e.g. Ibadan"
            />
          </Field>
          <Field label="Farm name (optional)">
            <input value={form.farm} onChange={set('farm')} />
          </Field>
        </div>

        <Field label="Description (optional)">
          <textarea rows={4} value={form.description} onChange={set('description')} />
        </Field>

        <div>
          <span className="label">Photos (up to {MAX_IMAGES})</span>
          {images.length > 0 && (
            <div className="previews">
              {images.map((url) => (
                <div key={url} className="preview">
                  <img src={url} alt="Selected listing" />
                  <button type="button" className="btn-quiet" onClick={() => removeImage(url)}>
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
          {images.length < MAX_IMAGES && (
            <input type="file" accept="image/*" multiple onChange={handleImages} />
          )}
        </div>

        <button className="btn" type="submit">Post listing</button>
      </form>
    </>
  )
}
