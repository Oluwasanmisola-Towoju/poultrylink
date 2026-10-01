import React from 'react';

export default function CoopHome() {
  return (
    <div className="page-container">
      <h1>Cooperative Cluster Dashboard</h1>
      <p className="muted">Manage member farms, pool input procurement, and aggregate bird produce sales.</p>

      <div className="stats-grid">
        <div className="card"><h3>42</h3><p>Member Farms</p></div>
        <div className="card"><h3>12,500</h3><p>Total Flock Capacity</p></div>
        <div className="card"><h3>₦4.2M</h3><p>Pooled Buying Power</p></div>
      </div>

      <div className="card" style={{ marginTop: '1.5rem' }}>
        <h3>Active Group Buying Orders</h3>
        <p className="small muted">Bulk feed purchase pool active. Joining lowers cost per bag by 12%.</p>
        <button className="btn">Initiate Bulk Feed Order</button>
      </div>
    </div>
  );
}