import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function NavBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const role = user?.role;

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light px-3">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/">
          LoyaltyApp
        </Link>

        {user && (
          <div className="collapse navbar-collapse">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">

              {/* 🌟 Shared Pages (All Roles) */}
              <li className="nav-item">
                <Link className="nav-link" to="/profile">Profile</Link>
              </li>

              {/* 🧍 Regular User */}
              {role === 'regular' && (
                <>
                  <li className="nav-item">
                    <Link className="nav-link" to="/points">My Points</Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to="/my-qr">My QR Code</Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to="/transfer">Transfer Points</Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to="/redeem">Redeem Points</Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to="/promotions">Promotions</Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to="/events">Published Events</Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to="/transactions">My Transactions</Link>
                  </li>
                </>
              )}

              {/* 💳 Cashier */}
              {role === 'cashier' && (
                <>
                  <li className="nav-item">
                    <Link className="nav-link" to="/create-transaction">Create Transaction</Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to="/process-redemption">Process Redemption</Link>
                  </li>
                </>
              )}

              {/* 👔 Manager */}
              {role === 'manager' && (
                <>
                  <li className="nav-item">
                    <Link className="nav-link" to="/users">Manage Users</Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to="/all-transactions">All Transactions</Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to="/create-promotion">Create Promotion</Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to="/promotions-manager">Manage Promotions</Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to="/create-event">Create Event</Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to="/events-manager">Manage Events</Link>
                  </li>
                </>
              )}

              {/* 🎤 Event Organizer (and Managers) */}
              {(role === 'manager' || role === 'event_organizer') && (
                <>
                  <li className="nav-item">
                    <Link className="nav-link" to="/my-events">My Events</Link>
                  </li>
                </>
              )}

              {/* 👑 Superuser */}
              {role === 'superuser' && (
                <li className="nav-item">
                  <Link className="nav-link" to="/promote">Promote User</Link>
                </li>
              )}
            </ul>
          </div>
        )}

        <div className="d-flex">
          {user ? (
            <>
              <span className="navbar-text me-3">
                <strong>{user.utorid}</strong> ({user.role})
              </span>
              <button className="btn btn-outline-danger" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <Link className="btn btn-outline-primary" to="/login">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
