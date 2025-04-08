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
  suspicious: boolean;
}

const UserUpdatePage: React.FC = () => {
    const { user } = useAuth();
    const [users, setUsers] = useState<UserInfo[]>([]);
    const [updatedUsers, setUpdatedUsers] = useState<Record<number, Partial<UserInfo>>>({});
    const [status, setStatus] = useState<{ message: string; success: boolean } | null>(null);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [count, setCount] = useState(0);
    const [limit] = useState(10);
  
    const fetchUsers = async () => {
      setLoading(true);
      setStatus(null);
      try {
        const res = await api.get('/users', { params: { page, limit } });
        console.log('Fetched users:', res.data.results);
        setUsers(res.data.results);
        setCount(res.data.count);
      } catch {
        setStatus({ message: 'Failed to fetch users.', success: false });
      } finally {
        setLoading(false);
      }
    };
  
    const handleFieldChange = (userId: number, field: keyof UserInfo, value: any) => {
      setUpdatedUsers((prev) => ({
        ...prev,
        [userId]: {
          ...prev[userId],
          [field]: value,
        },
      }));
    };
  
    const updateUser = async (userId: number) => {
      const updates = updatedUsers[userId];
      if (!updates) return;
  
      try {
        await api.patch(`/users/${userId}`, updates);
        setStatus({ message: `User #${userId} updated successfully.`, success: true });
        fetchUsers();
        setUpdatedUsers((prev) => {
          const newUpdates = { ...prev };
          delete newUpdates[userId];
          return newUpdates;
        });
      } catch {
        setStatus({ message: `Failed to update user #${userId}.`, success: false });
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
      <div className="container-fluid mt-5">
        <h2 className="mb-4">Update Users</h2>
  
        {loading ? (
          <p>Loading users...</p>
        ) : (
          <>
            <div className="table-responsive">
              <table className="table table-bordered table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>UTORid</th>
                    <th>Name</th>
                    <th style={{ minWidth: '250px' }}>Email</th>
                    <th>Role</th>
                    <th>Verified</th>
                    <th>Suspicious</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td>{u.utorid}</td>
                      <td>{u.name}</td>
                      <td>
                        <input
                          type="email"
                          className="form-control"
                          defaultValue={u.email}
                          onChange={(e) => handleFieldChange(u.id, 'email', e.target.value)}
                        />
                      </td>
                      <td>
                        <select
                          className="form-select"
                          defaultValue={u.role}
                          onChange={(e) => handleFieldChange(u.id, 'role', e.target.value)}
                        >
                          <option value="regular">Regular</option>
                          <option value="cashier">Cashier</option>
                          {user.role === 'superuser' && (
                            <>
                              <option value="manager">Manager</option>
                              <option value="superuser">Superuser</option>
                            </>
                          )}
                        </select>
                      </td>
                      <td className="text-center">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          defaultChecked={u.verified}
                          onChange={(e) => handleFieldChange(u.id, 'verified', e.target.checked)}
                        />
                      </td>
                      <td className="text-center">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={
                            updatedUsers[u.id]?.suspicious !== undefined
                            ? updatedUsers[u.id]?.suspicious
                            : u.suspicious ?? false
                        }
                        onChange={(e) => handleFieldChange(u.id, 'suspicious', e.target.checked)}
                        />
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => updateUser(u.id)}
                          disabled={!updatedUsers[u.id]}
                        >
                          Update
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
  
            {/* Pagination */}
            <div className="d-flex justify-content-between align-items-center mt-3">
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
  
            {/* Status Message */}
            {status && (
              <div
                className="mt-4 p-3 rounded"
                style={{
                  backgroundColor: status.success ? '#e7f1ff' : '#f8d7da',
                  color: status.success ? '#0d6efd' : '#dc3545',
                  border: `1px solid ${status.success ? '#0d6efd' : '#dc3545'}`,
                }}
              >
                {status.message}
              </div>
            )}
          </>
        )}
      </div>
    );
  };
  
  export default UserUpdatePage;  