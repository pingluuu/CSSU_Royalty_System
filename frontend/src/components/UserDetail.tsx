import { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import defaultAvatar from '../assets/default.png';
import { useNavigate } from 'react-router-dom';



export default function UserDetail() {
  const { user } = useAuth();
  const { userId } = useParams();
  const [userData, setUserData] = useState<any | null>(null);
  const [error, setError] = useState('');
  const [status, setStatus] = useState<{ message: string; success: boolean } | null>(null);
  const link_location = useLocation();
  const backLink = link_location.state?.from?.pathname + link_location.state?.from?.search || '/users';
  const navigate = useNavigate();
  
  // Editable fields
  const [email, setEmail] = useState('');
  const [verified, setVerified] = useState('');
  const [suspicious, setSuspicious] = useState('');
  const [role, setRole] = useState('');
  
  const isManager = user?.role === 'manager';
  const isSuperuser = user?.role === 'superuser';
  const isCashier = user?.role === 'cashier';
  const isRegular = user?.role === 'regular';

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get(`/users/${userId}`);
        setUserData(res.data);
        setEmail(res.data.email || '');
        setVerified(res.data.verified?.toString() || 'false');
        setSuspicious(res.data.suspicious?.toString() || 'false');
        setRole(res.data.role || '');
      } catch (err: any) {
        setError('Failed to fetch user details.');
      }
    };

    if (user?.role === 'cashier' || isManager || isSuperuser) {
      fetchUser();
    }
  }, [userId]);

  const handleUpdate = async () => {
    try {
      const payload: any = {};
      if (email !== userData.email) payload.email = email;
      if (verified !== userData.verified?.toString()) payload.verified = verified === 'true';
      if (suspicious !== userData.suspicious?.toString()) payload.suspicious = suspicious === 'true';
      if (role !== userData.role) payload.role = role;

      if (Object.keys(payload).length === 0) return;

      await api.patch(`/users/${userId}`, payload);
      setStatus({ message: 'User updated successfully.', success: true });
    } catch (err) {
      setStatus({ message: 'Failed to update user.', success: false });
    }
  };

  if (!userData) {
    return <div className="container mt-4">{error || 'Loading...'}</div>;
  }

  return (
    <div className="container mt-4" style={{ maxWidth: '800px' }}>
      {isCashier && <Link to="/retrieve-user" className="btn btn-secondary mb-3">
        &larr; Back to Users
      </Link>}
      {(isManager || isSuperuser) && <button  className="btn btn-secondary mb-3" onClick={()=> navigate(backLink)}>
        &larr; Back to Users
      </button>}
      <h2>User Details</h2>
      {(isManager || isSuperuser) && <div className="text-center my-4">
        <img
          src={userData.avatarUrl ? `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}${userData.avatarUrl}` : defaultAvatar}
          alt="User Avatar"
          className="rounded-circle"
          style={{ width: '160px', height: '160px', objectFit: 'cover', border: '2px solid #007bff' }}
        />
      </div>}
      <div className="row g-3 mb-4">
      <div className="col-md-6"><strong>ID:</strong> {userData.id}</div>
        <div className="col-md-6"><strong>Name:</strong> {userData.name}</div>
        <div className="col-md-6"><strong>UTORid:</strong> {userData.utorid}</div>
        <div className="col-md-6"><strong>Points:</strong> {userData.points}</div>
        <div className="col-md-6"><strong>Verified:</strong> {userData.verified ? 'Yes' : 'No'}</div>
        {userData.createdAt && (
          <div className="col-md-6"><strong>Created At:</strong> {new Date(userData.createdAt).toLocaleString()}</div>
        )}
        {userData.lastLogin && (
          <div className="col-md-6"><strong>Last Login:</strong> {new Date(userData.lastLogin).toLocaleString()}</div>
        )}
        {userData.birthday && (
          <div className="col-md-6"><strong>Birthday:</strong> {userData.birthday}</div>
        )}
        {userData.role && (
          <div className="col-md-6"><strong>Role:</strong> {userData.role}</div>
        )}
      </div>

      {(isManager || isSuperuser) && (
        <div className="card card-body bg-light mb-4">
          <h5 className="mb-3">Update User Info</h5>
          <div className="row g-3">
            <div className="col-md-6">
              <label>Email</label>
              <input className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="col-md-6">
              <label>Verified</label>
              <select className="form-select" value={verified} onChange={(e) => setVerified(e.target.value)}>
                <option value="true">True</option>
                <option value="false">False</option>
              </select>
            </div>
            <div className="col-md-6">
              <label>Suspicious</label>
              <select className="form-select" value={suspicious} onChange={(e) => setSuspicious(e.target.value)}>
                <option value="true">True</option>
                <option value="false">False</option>
              </select>
            </div>
            <div className="col-md-6">
              <label>Role</label>
              <select className="form-select" value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="regular">Regular</option>
                <option value="cashier">Cashier</option>
                {isSuperuser && (
                  <>
                    <option value="manager">Manager</option>
                    <option value="superuser">Superuser</option>
                  </>
                )}
              </select>
            </div>
            <div className="col-12 d-grid mt-2">
              <button className="btn btn-primary" onClick={handleUpdate}>Update</button>
            </div>
          </div>
        </div>
      )}

      <div className="card card-body bg-light">
        <h5>Promotions</h5>
        {userData.promotions.length === 0 ? (
          <p>No available promotions.</p>
        ) : (
          <ul className="list-group">
            {userData.promotions.map((promo: any) => (
              <li className="list-group-item" key={promo.id}>
                <strong>{promo.name}</strong> – {promo.points} points
              </li>
            ))}
          </ul>
        )}
      </div>

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