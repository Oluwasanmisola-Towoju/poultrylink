import React from 'react';

export default function VetHome() {
  return (
    <div className="page-container">
      <h1>Veterinary Services Portal</h1>
      <p className="muted">Manage farm consultations, flock health audits, and digital prescriptions.</p>

      <div className="stats-grid">
        <div className="card"><h3>3</h3><p>Upcoming Farm Visits</p></div>
        <div className="card"><h3>14</h3><p>Completed Consultations</p></div>
        <div className="card"><h3>₦15,000</h3><p>Consultation Rate / Visit</p></div>
      </div>

      <div className="card" style={{ marginTop: '1.5rem' }}>
        <h3>Scheduled Visits & Health Requests</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Farm Name</th>
              <th>Issue / Service</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Green Pastures Farm</td>
              <td>Routine Mortality Audit</td>
              <td>Tomorrow, 10:00 AM</td>
              <td><span className="badge warning">Pending</span></td>
            </tr>
            <tr>
              <td>Sunshine Hatcheries</td>
              <td>Vaccination Supervision</td>
              <td>Oct 2, 2026</td>
              <td><span className="badge success">Confirmed</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}