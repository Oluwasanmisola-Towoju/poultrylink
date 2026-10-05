import React, { useState } from 'react';

const ROLES = [
  { id: 'FARMER', label: 'Farmer', description: 'Produce & sell livestock, eggs, or day-old chicks.' },
  { id: 'BUYER', label: 'Buyer', description: 'Purchase poultry products for wholesale or retail.' },
  { id: 'SUPPLIER', label: 'Supplier', description: 'Sell feeds, vaccines, medication, and farm gear.' },
  { id: 'TRANSPORTER', label: 'Transporter', description: 'Provide haulage & logistics for livestock or feeds.' },
  { id: 'VETERINARIAN', label: 'Veterinarian', description: 'Provide health services, visits, and consultations.' },
  { id: 'COOPERATIVE', label: 'Cooperative', description: 'Manage group buying & farm cluster aggregation.' },
  { id: 'FINANCIER_INSURER', label: 'Financier / Insurance', description: 'Offer farm credit, micro-loans, or insurance policies.' },
];

export default function Onboarding() {
  const [selectedRole, setSelectedRole] = useState('FARMER');
  const [formData, setFormData] = useState({});

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = { role: selectedRole, profileDetails: formData };
    console.log('Submitting profile payload:', payload);
    // TODO: Send payload to backend / API endpoint
  };

  return (
    <div className="onboarding-container">
      <h2>Complete Your Profile</h2>
      <p className="muted">Select your primary role to set up your account workspace.</p>

      {/* Role Selection Grid */}
      <div className="role-grid">
        {ROLES.map((role) => (
          <div
            key={role.id}
            className={`role-card ${selectedRole === role.id ? 'active' : ''}`}
            onClick={() => {
              setSelectedRole(role.id);
              setFormData({}); // Clear form inputs on role switch
            }}
          >
            <strong>{role.label}</strong>
            <p className="small muted">{role.description}</p>
          </div>
        ))}
      </div>

      {/* Dynamic Profile Setup Form */}
      <form className="form stack" onSubmit={handleSubmit}>
        <h3>{ROLES.find((r) => r.id === selectedRole)?.label} Profile Details</h3>

        {selectedRole === 'FARMER' && (
          <>
            <label>
              Farm Name
              <input type="text" name="farmName" placeholder="e.g. Green Pastures Farm" required onChange={handleInputChange} />
            </label>
            <div className="row">
              <label>
                Farm Capacity (Birds)
                <input type="number" name="capacity" placeholder="1000" onChange={handleInputChange} />
              </label>
              <label>
                Location / State
                <input type="text" name="location" placeholder="e.g. Ogun State" required onChange={handleInputChange} />
              </label>
            </div>
          </>
        )}

        {selectedRole === 'BUYER' && (
          <>
            <label>
              Business / Buyer Name
              <input type="text" name="businessName" placeholder="e.g. Apex Outlets" required onChange={handleInputChange} />
            </label>
            <label>
              Buyer Type
              <select name="buyerType" onChange={handleInputChange}>
                <option value="RETAILER">Retailer / Supermarket</option>
                <option value="WHOLESALER">Wholesaler / Distributor</option>
                <option value="HOTEL_RESTAURANT">Hotel / Restaurant / Fast Food</option>
                <option value="INDIVIDUAL">Individual Consumer</option>
              </select>
            </label>
          </>
        )}

        {selectedRole === 'SUPPLIER' && (
          <>
            <label>
              Company Name
              <input type="text" name="companyName" placeholder="e.g. AgriFeed Supplies" required onChange={handleInputChange} />
            </label>
            <label>
              Product Category
              <select name="supplyCategory" onChange={handleInputChange}>
                <option value="FEEDS">Feeds & Nutrition</option>
                <option value="MEDICATION">Vaccines & Medication</option>
                <option value="EQUIPMENT">Cages, Feeders & Equipment</option>
              </select>
            </label>
          </>
        )}

        {selectedRole === 'TRANSPORTER' && (
          <>
            <label>
              Vehicle Type
              <select name="vehicleType" onChange={handleInputChange}>
                <option value="VENTILATED_TRUCK">Ventilated Live-Bird Truck</option>
                <option value="REFRIGERATED_VAN">Refrigerated Cold Truck</option>
                <option value="MOTORCYCLE">Light Delivery Van / Tricycle</option>
              </select>
            </label>
            <div className="row">
              <label>
                License Plate Number
                <input type="text" name="licensePlate" placeholder="LSD-123XY" required onChange={handleInputChange} />
              </label>
              <label>
                Operating State/Region
                <input type="text" name="operatingRegion" placeholder="e.g. Lagos & Ogun" required onChange={handleInputChange} />
              </label>
            </div>
          </>
        )}

        {selectedRole === 'VETERINARIAN' && (
          <>
            <div className="row">
              <label>
                VCN / License Number
                <input type="text" name="licenseNumber" placeholder="VCN/202X/XXXX" required onChange={handleInputChange} />
              </label>
              <label>
                Consultation Fee (₦)
                <input type="number" name="consultationFee" placeholder="15000" required onChange={handleInputChange} />
              </label>
            </div>
            <label>
              Primary Specialization
              <input type="text" name="specialization" placeholder="e.g. Poultry Pathology, Biosecurity Audit" onChange={handleInputChange} />
            </label>
          </>
        )}

        {selectedRole === 'COOPERATIVE' && (
          <>
            <label>
              Cooperative Union Name
              <input type="text" name="coopName" placeholder="e.g. Poultry Farmers Co-op" required onChange={handleInputChange} />
            </label>
            <div className="row">
              <label>
                Registration Number
                <input type="text" name="regNumber" placeholder="RC-XXXXXX" required onChange={handleInputChange} />
              </label>
              <label>
                Member Count
                <input type="number" name="memberCount" placeholder="50" onChange={handleInputChange} />
              </label>
            </div>
          </>
        )}

        {selectedRole === 'FINANCIER_INSURER' && (
          <>
            <label>
              Institution Name
              <input type="text" name="institutionName" placeholder="e.g. AgriMicro Finance Bank" required onChange={handleInputChange} />
            </label>
            <label>
              Service Type
              <select name="institutionType" onChange={handleInputChange}>
                <option value="INSURANCE">Poultry Mortality Insurance</option>
                <option value="FINANCE">Working Capital Loans</option>
                <option value="BOTH">Loans & Insurance Packages</option>
              </select>
            </label>
          </>
        )}

        <button type="submit" className="btn" style={{ marginTop: '1rem' }}>
          Complete Registration & Continue
        </button>
      </form>
    </div>
  );
}