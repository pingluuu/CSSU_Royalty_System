import { useAuth } from '../contexts/AuthContext';
import { useEffect, useState } from 'react';
import api from '../services/api';
import { Link } from 'react-router-dom';
import AvailablePoints from './AvailablePoints';

export default function LandingPage() {
  const capitalizeFirst = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const { user, setActiveRole } = useAuth();

  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (user?.role === 'regular') {
        try {
          await api.get('/users/me');
          const txRes = await api.get('/users/me/transactions', { params: { page: 1, limit: 5 } });
          setTransactions(txRes.data.results);
        } catch (err) {
          console.error('Failed to fetch user data:', err);
        }
      }
    };
    fetchUserData();
  }, [user]);

  const getSwitchableRoles = () => {
    if (user?.originalRole === 'manager') return ['regular', 'cashier'];
    if (user?.originalRole === 'superuser') return ['regular', 'cashier', 'manager'];
    return [];
  };

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

      {(user.originalRole === 'manager' || user.originalRole === 'superuser') && (
        <div className="dropdown mb-4">
          <button className="btn btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">
            Interface: {capitalizeFirst(user.role)}
          </button>
          <ul className="dropdown-menu">
            {getSwitchableRoles().map((r) => (
              <li key={r}>
                <button
                  className="dropdown-item"
                  onClick={() => setActiveRole(r)}
                  disabled={user.role === r}
                >
                  {capitalizeFirst(r)}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

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
        <div className="card shadow-sm border-0 mt-4">
          <div className="card-body">
            <h4 className="card-title mb-3 text-primary">Cashier Dashboard</h4>
            <div className="row g-3">
              <div className="col-md-6">
                <Link to="/create-transaction-cashier" className="btn btn-outline-primary w-100 py-3">
                  💳 Create Transaction
                </Link>
              </div>
              <div className="col-md-6">
                <Link to="/process-redemption" className="btn btn-outline-warning w-100 py-3">
                  🎁 Process Redemption
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {(user.role === 'manager' || user.role === 'superuser') && (
        <div className="card shadow-sm border-0 mt-4">
          <div className="card-body">
            <h4 className="card-title mb-3 text-primary">Admin Dashboard</h4>
            <div className="row g-3">
              <div className="col-md-4">
                <Link to="/all-events" className="btn btn-light border w-100 py-3">
                  📅 Manage Events
                </Link>
                <Link to="/create-event" className="btn btn-light border w-100 py-3 mt-2">
                  ➕ Create Event
                </Link>
              </div>
              <div className="col-md-4">
                <Link to="/promotions-manager" className="btn btn-light border w-100 py-3">
                  🎯 Manage Promotions
                </Link>
                <Link to="/create-promotion" className="btn btn-light border w-100 py-3 mt-2">
                  ➕ Create Promotion
                </Link>
              </div>
              <div className="col-md-4">
                <Link to="/promote" className="btn btn-light border w-100 py-3">
                  👥 User Management
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}