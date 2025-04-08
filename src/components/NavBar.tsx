import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function NavBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // 🔒 Hide navbar on login/register pages
  const hideNavbarPaths = ['/login', '/register'];
  if (hideNavbarPaths.some((path) => location.pathname.startsWith(path))) {
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const role = user?.role;

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light px-3">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/">LoyaltyApp</Link>

        {user && (
          <div className="collapse navbar-collapse">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">

              {/* 🌟 Shared Pages (All Roles) */}
              <li className="nav-item">
                <Link className="nav-link" to="/profile">Profile</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/my-transactions">My Transactions</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/all-events">All Events</Link>
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
                </>
              )}

              {/* 💳 Cashier */}
              {role === 'cashier' && (
                <>
                  <li className="nav-item">
                    <Link className="nav-link" to="/create-account">Register User</Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to="/create-transaction-cashier">Create Transaction</Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to="/process-redemption">Process Redemption</Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to="/promotions">Promotions</Link>
                  </li>
                </>
              )}

              {/* 👔 Manager */}
              {role === 'manager' && (
                <>
                  <li>
                    <Link className="nav-link" to="/users">Users</Link>
                  </li>
                  <li>
                    <Link className="nav-link" to="/update-users">Update User</Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to="/promote">Manage Users</Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to="/create-account">Register User</Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to="/create-transaction-manager">Create Transaction</Link>
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
                <li className="nav-item">
                  <Link className="nav-link" to="/my-events">My Events</Link>
                </li>
              )}

              {/* 👑 Superuser */}
              {role === 'superuser' && (
                <>
                  <li className="nav-item">
                    <Link className="nav-link" to="/create-account">Register User</Link>
                  </li>
                  <li>
                    <Link className="nav-link" to="/update-users">Update User</Link>
                  </li>
                  <li>
                    <Link className="nav-link" to="/users">Users</Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to="/promote">Promote User</Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to="/promotions-manager">Manage Promotions</Link>
                  </li>
                </>
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