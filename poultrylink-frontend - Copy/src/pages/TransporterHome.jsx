import React from 'react';

export default function TransporterHome() {
  return (
    <div className="page-container">
      <h1>Logistics & Haulage Hub</h1>
      <p className="muted">Accept transportation jobs for live birds, day-old chicks, feeds, and eggs.</p>

      <div className="stats-grid">
        <div className="card"><h3>Ventilated Truck</h3><p>Primary Vehicle</p></div>
        <div className="card"><h3>2</h3><p>Active Haulage Trips</p></div>
        <div className="card"><h3>4.9 ★</h3><p>Driver Rating</p></div>
      </div>

      <div className="card" style={{ marginTop: '1.5rem' }}>
        <h3>Available Transport Jobs Nearby</h3>
        <div className="stack">
          <div className="job-card">
            <div>
              <strong>500 Live Broilers Delivery</strong>
              <p className="small muted">Route: Abeokuta → Ikeja, Lagos (Distance: ~75km)</p>
            </div>
            <button className="btn">Accept Job (₦85,000)</button>
          </div>
          <div className="job-card">
            <div>
              <strong>100 Bags Layer Feed Transit</strong>
              <p className="small muted">Route: Ibadan → Oyo (Distance: ~50km)</p>
            </div>
            <button className="btn">Accept Job (₦45,000)</button>
          </div>
        </div>
      </div>
    </div>
  );
}