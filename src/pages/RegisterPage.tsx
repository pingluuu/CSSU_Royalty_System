import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';


const RegisterPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const resetToken = searchParams.get('token');
    const navigate = useNavigate();
    const { logout } = useAuth();


  const [utorid, setUtorid] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<{ message: string; success: boolean } | null>(null);
  const [loading, setLoading] = useState(false);

  const validatePassword = (pwd: string) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d]).{8,20}$/;
    return regex.test(pwd);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);

    if (!resetToken) {
      setStatus({ message: 'Reset token is missing in the URL.', success: false });
      return;
    }

    if (!validatePassword(password)) {
      setStatus({
        message:
          'Password must be 8-20 characters and include uppercase, lowercase, number, and special character.',
        success: false,
      });
      return;
    }

    setLoading(true);
    try {
      await api.post(`/auth/resets/${resetToken}`, {
        utorid,
        password,
      });

      setStatus({ message: 'Password set successfully! Redirecting to login...', success: true });

      setTimeout(() => {
        logout();
        navigate('/login');
      }, 2000); 

      setUtorid('');
      setPassword('');
    } catch (err: any) {
      if (err.response?.status === 404) {
        setStatus({ message: 'Invalid reset token.', success: false });
      } else if (err.response?.status === 410) {
        setStatus({ message: 'Reset token has expired.', success: false });
      } else {
        setStatus({ message: 'Something went wrong. Please try again.', success: false });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5 d-flex justify-content-center">
      <div className="card p-4 shadow-sm" style={{ maxWidth: '500px', width: '100%' }}>
        <h2 className="text-center mb-3">Set Your Password</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">UTORid</label>
            <input
              type="text"
              className="form-control"
              value={utorid}
              onChange={(e) => setUtorid(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">New Password</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="8-20 chars, incl. upper, lower, number, symbol"
            />
          </div>

          <button type="submit" className="btn btn-primary w-100" disabled={loading}>
            {loading ? 'Submitting...' : 'Set Password'}
          </button>
        </form>

        {status && (
          <div
            className="mt-3 p-3 rounded"
            style={{
              backgroundColor: status.success ? '#e7f1ff' : '#ffe7e7',
              color: status.success ? '#0d6efd' : '#dc3545',
              border: `1px solid ${status.success ? '#0d6efd' : '#dc3545'}`,
            }}
          >
            {status.message}
          </div>
        )}
      </div>
    </div>
  );
};

export default RegisterPage;