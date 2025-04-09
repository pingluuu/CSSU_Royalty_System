import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

export default function UserRetrieval() {
  const { user } = useAuth();
  const [inputId, setInputId] = useState('');
  const [status, setStatus] = useState<{ message: string; success: boolean } | null>(null);
  const navigate = useNavigate();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);

    if (!inputId.trim()) {
      setStatus({ message: 'Please enter a user ID.', success: false });
      return;
    }

    try {
      const res = await api.get(`/users/${inputId}`);
      // Success - navigate to user detail page
      navigate(`/users/${inputId}`);
    } catch (err: any) {
      console.error(err);
      setStatus({ message: 'User not found or you do not have access.', success: false });
    }
  };

  if (!user || (user.role !== 'cashier' && user.role !== 'manager' && user.role !== 'superuser')) {
    return <div className="container mt-5">You do not have access to this page.</div>;
  }

  return (
    <div className="container mt-5" style={{ maxWidth: '500px' }}>
      <h2 className="mb-4 text-center">Lookup User by ID</h2>
      <form onSubmit={handleSearch}>
        <div className="mb-3">
          <label htmlFor="userIdInput" className="form-label">User ID</label>
          <input
            type="number"
            className="form-control"
            id="userIdInput"
            value={inputId}
            onChange={(e) => setInputId(e.target.value)}
            placeholder="Enter user ID"
          />
        </div>
        <button type="submit" className="btn btn-primary w-100">Search</button>
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
  );
}