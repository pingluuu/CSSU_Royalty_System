import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

interface UserInfo {
  id: number;
  utorid: string;
  name: string;
  email: string;
  role: string;
  verified: boolean;
  createdAt: string;
  lastLogin: string | null;
}

const UsersListing: React.FC = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users', {
        params: { page, limit },
      });
      setUsers(res.data.results);
      setCount(res.data.count);
    } catch (err: any) {
      setError('Failed to fetch users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'manager' || user?.role === 'superuser') {
      fetchUsers();
    }
  }, [page]);

  const totalPages = Math.ceil(count / limit);

  if (!user || (user.role !== 'manager' && user.role !== 'superuser')) {
    return <div className="container mt-5">You do not have access to this page.</div>;
  }

  return (
    <div className="container mt-5">
      <h2 className="mb-4">User Listing</h2>

      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : (
        <>
          <table className="table table-bordered table-hover">
            <thead className="table-light">
              <tr>
                <th>UTORid</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Verified</th>
                <th>Last Login</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.utorid}</td>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.role}</td>
                  <td>{u.verified ? 'Yes' : 'No'}</td>
                  <td>{u.lastLogin ? new Date(u.lastLogin).toLocaleString() : 'Never'}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="pagination-controls d-flex justify-content-between align-items-center mt-3">
            <button
              className="btn btn-outline-primary"
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
            >
              Previous
            </button>
            <span>Page {page} of {totalPages}</span>
            <button
              className="btn btn-outline-primary"
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default UsersListing;