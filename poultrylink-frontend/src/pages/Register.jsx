import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ROLES, ROLE_LABEL, useAuth } from '../context/auth'

const STEPS = ['Select role', 'Personal details', 'Role profile', 'Review']

function StepDots({ step, total }) {
  return (
    <div className="steps">
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className={`dot${i <= step ? ' on' : ''}`} />
      ))}
    </div>
  )
}

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    role: ROLES.FARMER,
    name: '',
    email: '',
    phone: '',
    password: '',
    // Role-specific fields
    farmName: '',
    farmLocation: '',
    companyName: '',
    vehicleType: '',
    licenseNumber: '',
  })

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  const validateStep = () => {
    if (step === 1) {
      if (!form.name.trim()) return 'Enter your full name.'
      if (!/^\S+@\S+\.\S+$/.test(form.email)) return 'Enter a valid email address.'
      if (!form.phone.trim()) return 'Enter your phone number.'
      if (form.password.length < 6) return 'Password must be at least 6 characters.'
    }
    if (step === 2) {
      if (form.role === ROLES.FARMER) {
        if (!form.farmName.trim()) return 'Enter your farm name.'
        if (!form.farmLocation.trim()) return 'Enter your farm location.'
      }
      if (form.role === ROLES.SUPPLIER && !form.companyName.trim()) {
        return 'Enter your company or store name.'
      }
      if (form.role === ROLES.VETERINARIAN && !form.licenseNumber.trim()) {
        return 'Enter your VCN / License number.'
      }
    }
    return ''
  }

  const next = () => {
    const err = validateStep()
    if (err) return setError(err)
    setError('')
    setStep((prev) => Math.min(prev + 1, STEPS.length - 1))
  }

  const back = () => {
    setError('')
    setStep((prev) => Math.max(prev - 1, 0))
  }

  const handleSubmit = () => {
    const result = register({
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      password: form.password,
      role: form.role,
      profileDetails: {
        farmName: form.farmName,
        farmLocation: form.farmLocation,
        companyName: form.companyName,
        vehicleType: form.vehicleType,
        licenseNumber: form.licenseNumber,
      },
    })

    if (!result?.ok) return setError(result?.error || 'Registration failed')
    navigate('/otp')
  }

  return (
    <div className="auth-page">
      <h1>Create your account</h1>
      <StepDots step={step} total={STEPS.length} />
      <p className="muted small">{STEPS[step]}</p>
      {error && <p className="error" style={{ marginBottom: '.75rem' }}>{error}</p>}

      {/* STEP 0: Select Role */}
      {step === 0 && (
        <div className="stack">
          <p>What best describes you?</p>
          <div className="role-grid">
            {Object.values(ROLES)
              .filter((r) => r !== ROLES.ADMIN)
              .map((r) => (
                <button
                  key={r}
                  type="button"
                  className={`role-card${form.role === r ? ' selected' : ''}`}
                  onClick={() => setForm({ ...form, role: r })}
                >
                  {ROLE_LABEL[r] || r}
                </button>
              ))}
          </div>
        </div>
      )}

      {/* STEP 1: Personal Details */}
      {step === 1 && (
        <div className="stack">
          <label>
            Full name
            <input value={form.name} onChange={set('name')} placeholder="John Doe" />
          </label>
          <label>
            Email
            <input type="email" value={form.email} onChange={set('email')} placeholder="john@example.com" />
          </label>
          <label>
            Phone number
            <input value={form.phone} onChange={set('phone')} placeholder="+234..." />
          </label>
          <label>
            Password
            <input type="password" value={form.password} onChange={set('password')} />
          </label>
          <label>
            Confirm password
            <input type="password" value={form.confirmPassword} onChange={set('confirmPassword')} />
          </label>
        </div>
      )}

      {/* STEP 2: Role-Specific Details */}
      {step === 2 && (
        <div className="stack">
          {form.role === ROLES.FARMER && (
            <>
              <label>
                Farm name
                <input value={form.farmName} onChange={set('farmName')} placeholder="Green Pastures Farm" />
              </label>
              <label>
                Farm location
                <input value={form.farmLocation} onChange={set('farmLocation')} placeholder="e.g. Ibadan" />
              </label>
            </>
          )}

          {form.role === ROLES.SUPPLIER && (
            <label>
              Company / Store name
              <input value={form.companyName} onChange={set('companyName')} placeholder="AgriFeeds Ltd" />
            </label>
          )}

          {form.role === ROLES.TRANSPORTER && (
            <label>
              Vehicle type
              <input value={form.vehicleType} onChange={set('vehicleType')} placeholder="e.g. Ventilated Truck" />
            </label>
          )}

          {form.role === ROLES.VETERINARIAN && (
            <label>
              VCN / License Number
              <input value={form.licenseNumber} onChange={set('licenseNumber')} placeholder="VCN/202X/XXXX" />
            </label>
          )}

          {/* Fallback for Buyer or roles with no extra fields required */}
          {![ROLES.FARMER, ROLES.SUPPLIER, ROLES.TRANSPORTER, ROLES.VETERINARIAN].includes(form.role) && (
            <p className="muted">No additional profile details required for this role. Click continue to review.</p>
          )}
        </div>
      )}

      {/* STEP 3: Review */}
      {step === 3 && (
        <div className="stack">
          <dl className="facts">
            <div><dt>Role</dt><dd>{ROLE_LABEL[form.role] || form.role}</dd></div>
            <div><dt>Name</dt><dd>{form.name}</dd></div>
            <div><dt>Email</dt><dd>{form.email}</dd></div>
            <div><dt>Phone</dt><dd>{form.phone}</dd></div>
            {form.role === ROLES.FARMER && (
              <>
                <div><dt>Farm</dt><dd>{form.farmName}</dd></div>
                <div><dt>Location</dt><dd>{form.farmLocation}</dd></div>
              </>
            )}
          </dl>
          <p className="muted small">
            You'll be asked for a one-time code next, then your account moves to verification review.
          </p>
        </div>
      )}

      {/* Navigation Actions */}
      <div className="actions" style={{ marginTop: '1.25rem' }}>
        {step > 0 && <button type="button" className="btn-quiet" onClick={back}>Back</button>}
        {step < STEPS.length - 1 ? (
          <button type="button" className="btn" onClick={next}>Continue</button>
        ) : (
          <button type="button" className="btn" onClick={handleSubmit}>Create account</button>
        )}
      </div>

      <p className="muted small" style={{ marginTop: '1.5rem' }}>
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </div>
  )
}