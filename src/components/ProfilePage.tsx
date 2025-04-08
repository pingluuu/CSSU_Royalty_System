import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import defaultimg from '../assets/default.png';

export default function ProfilePage() {
  const { user, login, refreshUser } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [avatar, setAvatar] = useState<File | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('email', email);
      if (avatar) formData.append('avatar', avatar);

      await api.patch('/users/me', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Re-login if password is changed
      if (password && user) {
        await api.patch('/users/me/password', {
          old: password, // password already updated
          new: password,
        });
        await login(user.utorid, password);
        setPassword('');
      }

      await refreshUser(); // get updated image or fields
      setMessage('✅ Profile updated successfully.');
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || '⚠️ Failed to update profile.');
    }
  };

  if (!user) return <div className="container mt-4">You must be logged in to view this page.</div>;

  return (
    <div className="container mt-5" style={{ maxWidth: '720px' }}>
      <h2 className="mb-4" style={{ textAlign: 'center' }}>My Profile</h2>

      <div className="text-center mt-4" style={{ marginBottom: '40px' }}>
        <img
            src={user.avatarUrl || defaultimg}
            alt="Profile Avatar"
            className="rounded-circle"
            style={{ width: '170px', height: '170px', objectFit: 'cover', border: '2px solid #007bff' }}
        />
       </div>

      <form onSubmit={handleUpdate} className="row g-3 shadow-sm p-4 border rounded bg-light" encType="multipart/form-data">
        <div className="col-md-6">
          <label className="form-label">Name</label>
          <input
            type="text"
            className="form-control"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="col-md-6">
          <label className="form-label">Email</label>
          <input
            type="email"
            className="form-control"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="col-md-6">
          <label className="form-label">Change Password (optional)</label>
          <input
            type="password"
            className="form-control"
            placeholder="Leave blank to keep current"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="col-md-6">
          <label className="form-label">Upload Avatar (optional)</label>
          <input
            type="file"
            className="form-control"
            accept="image/*"
            onChange={(e) => setAvatar(e.target.files?.[0] || null)}
          />
        </div>

        <div className="col-md-6">
          <label className="form-label">UTORid</label>
          <input className="form-control" disabled value={user.utorid} />
        </div>
        <div className="col-md-6">
          <label className="form-label">Role</label>
          <input className="form-control" disabled value={user.role} />
        </div>
        <div className="col-md-6">
          <label className="form-label">Verified</label>
          <input className="form-control" disabled value={user.verified ? 'Yes' : 'No'} />
        </div>

        <div className="col-12 d-grid">
          <button type="submit" className="btn btn-primary">Save Changes</button>
        </div>

        {message && (
          <div className="mt-3 p-3 rounded" style={{
            backgroundColor: '#e7f1ff',
            color: '#0d6efd',
            border: '1px solid #0d6efd'
          }}>
            {message}
          </div>
        )}
        {error && (
          <div className="mt-3 p-3 rounded" style={{
            backgroundColor: '#ffe7e7',
            color: '#dc3545',
            border: '1px solid #dc3545'
          }}>
            {error}
          </div>
        )}
      </form>
    </div>
  );
}