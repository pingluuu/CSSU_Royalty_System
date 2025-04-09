import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
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

export default function UsersListing() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const initPage = parseInt(searchParams.get("page") || "1", 10);
  const initName = searchParams.get("name") || "";
  const initRole = searchParams.get("role") || "";
  const initVerified = searchParams.get("verified") || "";
  const initActivated = searchParams.get("activated") || "";

  const [users, setUsers] = useState<UserInfo[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(initPage);
  const [limit] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [name, setName] = useState(initName);
  const [role, setRole] = useState(initRole);
  const [verified, setVerified] = useState(initVerified);
  const [activated, setActivated] = useState(initActivated);
  const [fetchTrigger, setFetchTrigger] = useState(0);

  const totalPages = Math.ceil(count / limit);

  const updateURL = () => {
    const params: any = { page: page.toString() };
    if (name) params.name = name;
    if (role) params.role = role;
    if (verified) params.verified = verified;
    if (activated) params.activated = activated;
    setSearchParams(params);
  };

  const applyFilters = (e: React.FormEvent) => {
    e.preventDefault();
    if (page !== 1) setPage(1);
    else setFetchTrigger(f => f + 1);
  };

  const fetchUsers = async () => {
    setLoading(true);
    const params: any = { page, limit };
    if (name) params.name = name;
    if (role) params.role = role;
    if (verified) params.verified = verified === 'true';
    if (activated) params.activated = activated === 'true';

    try {
      const res = await api.get('/users', { params });
      setUsers(res.data.results);
      setCount(res.data.count);
    } catch (err) {
      setError('Failed to fetch users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'manager' || user?.role === 'superuser') {
      updateURL();
      fetchUsers();
    }
  }, [page, fetchTrigger]);

  if (!user || (user.role !== 'manager' && user.role !== 'superuser')) {
    return <div className="container mt-5">You do not have access to this page.</div>;
  }

  return (
    <div className="container mt-4" style={{ maxWidth: '925px' }}>
      <h2>Users</h2>

      <form className="mb-4" onSubmit={applyFilters}>
        <div className="row">
          <div className="col-md-3">
            <label className="form-label">Name/UTORid:</label>
            <input
              type="text"
              className="form-control"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Search by name/UTORid"
            />
          </div>
          <div className="col-md-3">
            <label className="form-label">Role:</label>
            <select
              className="form-select"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="">All</option>
              <option value="regular">Regular</option>
              <option value="cashier">Cashier</option>
              <option value="manager">Manager</option>
              <option value="superuser">Superuser</option>
            </select>
          </div>
          <div className="col-md-3">
            <label className="form-label">Verified:</label>
            <select
              className="form-select"
              value={verified}
              onChange={(e) => setVerified(e.target.value)}
            >
              <option value="">Any</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>
          <div className="col-md-3">
            <label className="form-label">Activated:</label>
            <select
              className="form-select"
              value={activated}
              onChange={(e) => setActivated(e.target.value)}
            >
              <option value="">Any</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>
        </div>
        <div className="row mt-3">
          <div className="col-md-12 align-items-center">
            <button type="submit" className="btn btn-primary w-100">Apply Filters</button>
          </div>
        </div>
      </form>

      {loading ? (
        <p>Loading users...</p>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : users.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <>
          {users.map((u) => (
            <div
              key={u.id}
              className="transaction-card transaction-adjustment mb-3"
              style={{ textDecoration: 'none', color: 'inherit', cursor: 'pointer', backgroundColor: "#f3f4f6", borderLeft: "5px solid #6c757d"}}              onClick={() => navigate(`/users/${u.id}`)}
            >
              <h5>User #{u.id}</h5>
              <p>
                <strong>Name:</strong> {u.name} <br />
                <strong>UTORid:</strong> {u.utorid} <br />
                <strong>Email:</strong> {u.email} <br />
                <strong>Role:</strong> {u.role} <br />
                <strong>Verified:</strong> {u.verified ? "Yes" : "No"} <br />
                <strong>Last Login:</strong> {u.lastLogin ? new Date(u.lastLogin).toLocaleString() : "Never"}
              </p>
            </div>
          ))}

          <div className="pagination-controls mt-4">
            <button
              className="btn btn-outline-primary"
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page <= 1}
            >
              Previous
            </button>
            <span className="mx-3">Page {page} of {totalPages}</span>
            <button
              className="btn btn-outline-primary"
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page >= totalPages}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}