import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

function LoginPage() {
  const [utorid, setUtorid] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    const result = await login(utorid, password);
    if (!result.success) {
      setError('Login failed. Please check your credentials.');
    } else {
      navigate('/');
    }
  };

  return (
    <div className="container d-flex flex-column justify-content-center align-items-center vh-100">
      <div className="card p-4 shadow-sm" style={{ width: '100%', maxWidth: '400px' }}>
        <h2 className="text-center mb-4">Login</h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="utorid" className="form-label">UTORid</label>
            <input
              type="text"
              id="utorid"
              className="form-control"
              value={utorid}
              onChange={(e) => setUtorid(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              type="password"
              id="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <div className="alert alert-danger py-2">{error}</div>}

          <button type="submit" className="btn btn-primary w-100 mt-2">Login</button>
        </form>
      </div>

      {/* Cool link to landing page */}
      <div className="mt-4">
        <Link to="/" className="text-decoration-none text-primary fw-medium">
          ← Back to Main Page
        </Link>
      </div>
    </div>
  );
}

export default LoginPage;