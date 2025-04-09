import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { Link } from 'react-router-dom';

const CreateAccount: React.FC = () => {
  const { user } = useAuth();
  const [utorid, setUtorid] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [status, setStatus] = useState<{ message: string; success: boolean } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);
    setResetToken(null);
    setCopied(false);

    if (!/^[a-zA-Z0-9]{8}$/.test(utorid)) {
      setStatus({ message: 'UTORid must be exactly 8 alphanumeric characters.', success: false });
      return;
    }

    if (!email.endsWith('@mail.utoronto.ca')) {
      setStatus({ message: 'Email must be a valid UofT email.', success: false });
      return;
    }

    try {
      const payload = { utorid, name, email };
      const response = await api.post('/users', payload);

      setStatus({
        message: `User ${response.data.utorid} registered successfully.`,
        success: true,
      });
      setResetToken(response.data.resetToken);
      setUtorid('');
      setName('');
      setEmail('');
    } catch (err: any) {
      if (err.response?.status === 409) {
        setStatus({ message: 'User with this UTORid or email address already exists.', success: false });
      } else {
        setStatus({ message: 'Failed to register user.', success: false });
      }
    }
  };

  const handleCopy = () => {
    if (resetToken) {
      navigator.clipboard.writeText(resetToken);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!user || !['cashier', 'manager', 'superuser'].includes(user.role)) {
    return (
      <div className="container mt-5 text-center">
        <div className="alert alert-warning">You do not have access to this page.</div>
      </div>
    );
  }

  return (
    <div className="container mt-5 d-flex justify-content-center">
      <div className="card p-4 shadow-sm" style={{ maxWidth: '500px', width: '100%' }}>
        <h2 className="text-center mb-3">Register New User</h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">UTORid</label>
            <input
              type="text"
              className="form-control"
              value={utorid}
              onChange={(e) => setUtorid(e.target.value)}
              required
              maxLength={8}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Name</label>
            <input
              type="text"
              className="form-control"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={50}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">UofT Email</label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary w-100">Create Account</button>
        </form>

        {/* Status Message */}
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

        {/* Reset Token Copy Area */}
        {resetToken && (
          <div className="mt-4">
            <label className="form-label fw-semibold">Reset Token (for user to set their password):</label>
            <div className="input-group">
              <input type="text" className="form-control" value={resetToken} readOnly />
              <button type="button" className="btn btn-outline-primary" style={{marginTop: 0}} onClick={handleCopy}>
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>

            <div className="mt-2">
              <Link to={`/register?token=${resetToken}`} className="text-decoration-underline text-primary">
                → Go to registration page
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateAccount;