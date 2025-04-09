import { useState } from 'react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function PromoteUserPage() {
    // Removed unused 'user' variable
    const [utorid, setUtorid] = useState('');
    const [form, setForm] = useState({
        email: '',
        verified: false,
        suspicious: false,
        role: 'regular',
    });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const { user } = useAuth();
    const isSuperuser = user?.role === 'superuser';

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const target = e.target as HTMLInputElement | HTMLSelectElement;
        const { name, value, type } = target;
        const checked = (target as HTMLInputElement).checked;
        const val = type === 'checkbox' ? checked : value;
        setForm((prev) => ({ ...prev, [name]: val }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');
        setError('');

        try {
            // Step 1: Get user by UTORid
            const response = await api.get('/users', { params: { name: utorid, limit: 1 } });
            const user = response.data?.results?.[0];

            if (!user || !user.id) {
                setError('User not found');
                return;
            }

            // Step 2: Prepare and send PATCH to /users/:id
            const payload = {
                ...form,
                verified: Boolean(form.verified),
                suspicious: Boolean(form.suspicious),
            };

            const res = await api.patch(`/users/${user.id}`, payload);
            setMessage(`User "${res.data.utorid}" updated successfully.`);
        } catch (err: any) {
            console.error('Promote failed:', err);
            setError(err.response?.data?.message || 'Failed to promote user.');
        }
    };




    return (
        <div className="container mt-4">
            <h2>Promote / Update User</h2>

            <form onSubmit={handleSubmit} className="row g-3">
                <div className="col-md-6">
                    <label className="form-label">UTORid</label>
                    <input
                        type="text"
                        className="form-control"
                        value={utorid}
                        onChange={(e) => setUtorid(e.target.value)}
                        required
                    />
                </div>

                <div className="col-md-6">
                    <label className="form-label">Email</label>
                    <input
                        type="email"
                        className="form-control"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                    />
                </div>

                <div className="col-md-4">
                    <label className="form-label">Role</label>
                    <select className="form-select" name="role" value={form.role} onChange={handleChange}>
                        <option value="regular">Regular</option>
                        <option value="cashier">Cashier</option>
                        {(isSuperuser) && <option value="manager">Manager</option>}
                        {(isSuperuser) && <option value="superuser">Superuser</option>}
                    </select>
                </div>

                <div className="col-md-4 form-check mt-4">
                    <input
                        className="form-check-input"
                        type="checkbox"
                        name="verified"
                        checked={form.verified}
                        onChange={handleChange}
                        id="verifiedCheck"
                    />
                    <label className="form-check-label" htmlFor="verifiedCheck">
                        Verified
                    </label>
                </div>

                <div className="col-md-4 form-check mt-4">
                    <input
                        className="form-check-input"
                        type="checkbox"
                        name="suspicious"
                        checked={form.suspicious}
                        onChange={handleChange}
                        id="suspiciousCheck"
                    />
                    <label className="form-check-label" htmlFor="suspiciousCheck">
                        Suspicious
                    </label>
                </div>

                <div className="col-12">
                    <button type="submit" className="btn btn-primary">
                        Promote / Update
                    </button>
                </div>
            </form>

            {message && <div className="alert alert-success mt-3">{message}</div>}
            {error && <div className="alert alert-danger mt-3">{error}</div>}
        </div>
    );
}
