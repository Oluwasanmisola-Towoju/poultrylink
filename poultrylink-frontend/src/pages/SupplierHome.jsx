import React from 'react';
import { Link } from 'react-router-dom';

export default function SupplierHome() {
  return (
    <div className="page-container">
      <div className="header-actions">
        <div>
          <h1>Supplier Storefront</h1>
          <p className="muted">Manage feeds, medications, vaccines, and farm equipment inventory.</p>
        </div>
        <Link to="/supplier/catalog/new" className="btn">Add New Item</Link>
      </div>

      <div className="stats-grid">
        <div className="card"><h3>12</h3><p>Active Listings</p></div>
        <div className="card"><h3>₦1,250,000</h3><p>Monthly Sales</p></div>
        <div className="card"><h3>8</h3><p>Pending Delivery Requests</p></div>
      </div>

      <div className="card" style={{ marginTop: '1.5rem' }}>
        <h3>Store Inventory</h3>
        <ul className="list">
          <li><strong>Grower Mash 25kg</strong> - 150 Bags in Stock (₦14,500/bag)</li>
          <li><strong>Newcastle Vaccine (1000 doses)</strong> - 20 Vials in Stock (₦8,500/vial)</li>
          <li><strong>Automatic Nipple Drinkers</strong> - 45 Units in Stock (₦3,200/unit)</li>
        </ul>
      </div>
    </div>
  );
}