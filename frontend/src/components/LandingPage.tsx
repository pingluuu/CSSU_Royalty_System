import { useAuth } from '../contexts/AuthContext';
import { useEffect, useState } from 'react';
import api from '../services/api';
import { Link } from 'react-router-dom';
import AvailablePoints from './AvailablePoints';

export default function LandingPage() {
  const capitalizeFirst = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };
  
  const { user } = useAuth();
  // Removed unused points state
  const [transactions, setTransactions] = useState<any[]>([
    { id: 101, type: 'purchase', amount: 120 },
    { id: 102, type: 'adjustment', amount: -20 },
    { id: 103, type: 'redemption', amount: 100 },
    { id: 104, type: 'event', amount: 75 },
    { id: 105, type: 'transfer', amount: 50 },
  ]);
  
  useEffect(() => {
    const fetchUserData = async () => {
      if (user?.role === 'regular') {
        try {
          await api.get('/users/me');
          // Removed setPoints as points state is no longer used
          const txRes = await api.get('/transactions', { params: { page: 1, limit: 5 } });
          setTransactions(txRes.data.results);
        } catch (err) {
          console.error('Failed to fetch user data:', err);
        }
      }
    };
    fetchUserData();
  }, [user]);

  if (!user) {
    return (
      <div className="container mt-5 d-flex flex-column align-items-center text-center">
        <h1 className="display-4 mb-3 text-primary fw-bold">Welcome to LoyaltyApp 🎉</h1>
        <p className="lead mb-4" style={{ maxWidth: '600px' }}>
          This loyalty program allows users to earn points for purchases and redeem them for rewards.
        </p>
        <Link to="/login" className="btn btn-lg btn-outline-primary">
          Login to Get Started
        </Link>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h2>Welcome, {capitalizeFirst(user.name)}!</h2>

      {user.role === 'regular' && (
        <>
          <div className="mb-4">
            <AvailablePoints />
          </div>

          <div className="card shadow-sm mb-4">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">Recent Transactions</h5>
            </div>
            <ul className="list-group list-group-flush">
              {transactions.map(tx => (
                <li key={tx.id} className="list-group-item d-flex justify-content-between align-items-center">
                  <div>
                    <strong>#{tx.id}</strong>: {capitalizeFirst(tx.type)}{' '}
                  </div>
                  <span className="badge bg-secondary">{tx.amount ?? tx.spent} pts</span>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}

      {user.role === 'cashier' && (
        <>
          <h4>Cashier Dashboard</h4>
          <div className="mt-3">
            <Link to="/create-transaction-cashier" className="btn btn-primary me-2">Create Transaction</Link>
            <Link to="/process-redemption" className="btn btn-warning">Process Redemption</Link>
          </div>
        </>
      )}

      {(user.role === 'manager' || user.role === 'superuser') && (
        <>
          <h4>Admin Dashboard</h4>
          <div className="row mt-3">
            <div className="col-md-4">
              <Link to="/all-events" className="btn btn-outline-info w-100 mb-2">Manage Events</Link>
              <Link to="/create-event" className="btn btn-outline-secondary w-100 mb-2">Create New Event</Link>
            </div>
            <div className="col-md-4">
              <Link to="/promotions-manager" className="btn btn-outline-success w-100 mb-2">Manage Promotions</Link>
              <Link to="/create-promotion" className="btn btn-outline-secondary w-100 mb-2">Create Promotion</Link>
            </div>
            <div className="col-md-4">
              <Link to="/promote" className="btn btn-outline-dark w-100 mb-2">User Management</Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}