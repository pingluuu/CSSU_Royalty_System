import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

export default function ProfilePage() {
    const { user, login } = useAuth();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
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
            const payload: any = { name, email };
            if (password.trim() !== '') {
                payload.password = password;
            }

            await api.patch('/users/me', payload);
            setMessage('✅ Profile updated successfully.');

            // Re-login to refresh context if password was changed
            if (password) {
                if (user) {
                    await login(user.utorid, password);
                }
                setPassword('');
            }
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || '⚠️ Failed to update profile.');
        }
    };

    if (!user) return <div className="container mt-4">You must be logged in to view this page.</div>;

    return (
            <div className="container mt-5" style={{ maxWidth: '720px' }}>
                <h2 className="mb-4" style={{textAlign: 'center'}}>My Profile</h2>
                {user.avatarUrl && (
                <div className="text-center mt-4" style={{ marginBottom: '40px' }}>
                <img
                    src={user.avatarUrl}
                    alt="Profile Avatar"
                    className="rounded-circle"
                    style={{ width: '170px', height: '170px', objectFit: 'cover' }}
                />
                </div>
            )}
            <form onSubmit={handleUpdate} className="row g-3 shadow-sm p-4 border rounded bg-light">
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

                {message && <div className="alert alert-success mt-3">{message}</div>}
                {error && <div className="alert alert-danger mt-3">{error}</div>}
            </form>
        </div>
    );
}
