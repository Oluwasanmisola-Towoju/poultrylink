import React from 'react';

export default function FinancierHome() {
  return (
    <div className="page-container">
      <h1>Financier & Insurance Workspace</h1>
      <p className="muted">Evaluate farm credit metrics, disburse micro-loans, and underwrite mortality insurance.</p>

      <div className="stats-grid">
        <div className="card"><h3>₦15.0M</h3><p>Active Portfolio</p></div>
        <div className="card"><h3>5</h3><p>Pending Credit Applications</p></div>
        <div className="card"><h3>0.8%</h3><p>Mortality Claim Rate</p></div>
      </div>

      <div className="card" style={{ marginTop: '1.5rem' }}>
        <h3>Recent Credit & Insurance Requests</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Applicant</th>
              <th>Request Type</th>
              <th>Amount / Value</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Apex Poultry Farm</td>
              <td>Feed Working Capital Loan</td>
              <td>₦1,500,000</td>
              <td><button className="btn-quiet">Review Credit Score</button></td>
            </tr>
            <tr>
              <td>Sunrise Agro Co-op</td>
              <td>Flock Mortality Policy</td>
              <td>5,000 Birds</td>
              <td><button className="btn-quiet">Underwrite Policy</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}