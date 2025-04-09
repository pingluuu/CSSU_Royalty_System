import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './NavBar.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

export default function NavBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

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
    <nav className="navbar navbar-expand-lg navbar-light bg-light px-3 shadow-sm">
      <div className="container-fluid">
        <Link className="navbar-brand custom-brand" to="/">
          <span className="brand-icon">🎯</span> LoyaltyApp
        </Link>

        {user && (
          <>
            <button
              className="navbar-toggler"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#navbarSupportedContent"
              aria-controls="navbarSupportedContent"
              aria-expanded="false"
              aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon"></span>
            </button>

            <div className="collapse navbar-collapse" id="navbarSupportedContent">
              <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                {/* Common */}
                <li className="nav-item"><Link className="nav-link" to="/profile">Profile</Link></li>
                <li className="nav-item"><Link className="nav-link" to="/my-transactions">My Transactions</Link></li>
                <li className="nav-item"><Link className="nav-link" to="/all-events">All Events</Link></li>

                {/* Role-specific */}
                {role === 'regular' && (
                  <>
                    <li className="nav-item"><Link className="nav-link" to="/my-qr">My QR Code</Link></li>
                    <li className="nav-item"><Link className="nav-link" to="/transfer">Transfer Points</Link></li>
                    <li className="nav-item"><Link className="nav-link" to="/redeem">Redeem Points</Link></li>
                    <li className="nav-item"><Link className="nav-link" to="/promotions">Promotions</Link></li>
                    <li className="nav-item"><Link className="nav-link" to="/events">Published Events</Link></li>
                  </>
                )}

                {role === 'cashier' && (
                  <>
                    <li className="nav-item"><Link className="nav-link" to="/create-account">Register User</Link></li>
                    <li className="nav-item"><Link className="nav-link" to="/transfer">Transfer Points</Link></li>
                    <li className="nav-item"><Link className="nav-link" to="/create-transaction-cashier">Create Transaction</Link></li>
                    <li className="nav-item"><Link className="nav-link" to="/process-redemption">Process Redemption</Link></li>
                    <li className="nav-item"><Link className="nav-link" to="/promotions">Promotions</Link></li>
                  </>
                )}

                {role === 'manager' && (
                  <>
                    <li><Link className="nav-link" to="/users">Users</Link></li>
                    <li><Link className="nav-link" to="/update-users">Update User</Link></li>
                    <li className="nav-item"><Link className="nav-link" to="/transfer">Transfer Points</Link></li>
                    <li className="nav-item"><Link className="nav-link" to="/promote">Manage Users</Link></li>
                    <li className="nav-item"><Link className="nav-link" to="/create-account">Register User</Link></li>
                    <li className="nav-item"><Link className="nav-link" to="/create-transaction-manager">Create Transaction</Link></li>
                    <li className="nav-item"><Link className="nav-link" to="/all-transactions">All Transactions</Link></li>
                    <li className="nav-item"><Link className="nav-link" to="/create-promotion">Create Promotion</Link></li>
                    <li className="nav-item"><Link className="nav-link" to="/promotions-manager">Manage Promotions</Link></li>
                    <li className="nav-item"><Link className="nav-link" to="/create-event">Create Event</Link></li>
                    <li className="nav-item"><Link className="nav-link" to="/events-manager">Manage Events</Link></li>
                  </>
                )}

                {(role === 'manager' || role === 'event_organizer') && (
                  <li className="nav-item"><Link className="nav-link" to="/my-events">My Events</Link></li>
                )}

                {role === 'superuser' && (
                  <>
                    <li className="nav-item"><Link className="nav-link" to="/create-account">Register User</Link></li>
                    <li className="nav-item"><Link className="nav-link" to="/transfer">Transfer Points</Link></li>
                    <li><Link className="nav-link" to="/update-users">Update User</Link></li>
                    <li><Link className="nav-link" to="/users">Users</Link></li>
                    <li className="nav-item"><Link className="nav-link" to="/promote">Promote User</Link></li>
                    <li className="nav-item"><Link className="nav-link" to="/promotions-manager">Manage Promotions</Link></li>
                  </>
                )}

                {/* Mobile-only logout */}
                <li className="nav-item d-lg-none mt-2">
                  <button className="btn btn-outline-danger w-100" onClick={handleLogout}>
                    Logout
                  </button>
                </li>
              </ul>
            </div>
          </>
        )}

        {/* User info + logout on larger screens */}
        {user && (
          <div className="d-none d-lg-flex align-items-center">
            <span className="me-2 badge bg-secondary">{user.utorid}</span>
            <span className="me-3 badge bg-primary text-uppercase">{user.role}</span>
            <button className="btn btn-outline-danger btn-sm" onClick={handleLogout}>
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}