import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../../services/api';
//import './PromotionDetailPage.css';

export default function PromotionDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [promotion, setPromotion] = useState<any>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [form, setForm] = useState<any>({});

    const fetchPromotion = async () => {
        try {
            const res = await api.get(`/promotions/${id}`);
            setPromotion(res.data);
            setForm({
                ...res.data,
                startTime: res.data.startTime.slice(0, 16),
                endTime: res.data.endTime.slice(0, 16),
            });
        } catch (err) {
            console.error('Failed to fetch promotion:', err);
        }
    };

    const handleEditToggle = () => {
        setIsEditing((prev) => !prev);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setForm((prev: any) => ({ ...prev, [name]: value }));
    };

    const handleUpdate = async () => {
        try {
            await api.patch(`/promotions/${id}`, {
                ...form,
                minSpending: form.minSpending ? parseFloat(form.minSpending) : null,
                rate: form.rate ? parseFloat(form.rate) : null,
                points: form.points ? parseInt(form.points) : null,
            });
            alert('Promotion updated successfully');
            setIsEditing(false);
            fetchPromotion();
        } catch (err) {
            console.error('Failed to update promotion:', err);
            alert('Update failed');
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this promotion?')) return;
        try {
            await api.delete(`/promotions/${id}`);
            alert('Promotion deleted');
            navigate('/promotions-manager');
        } catch (err) {
            console.error('Failed to delete promotion:', err);
            alert('Delete failed');
        }
    };

    useEffect(() => {
        fetchPromotion();
    }, [id]);

    if (!promotion) return <div>Loading...</div>;

    return (
        <div className="container mt-4">
            <h2>Promotion Detail</h2>

            {isEditing ? (
                <form className="row g-3">
                    <div className="col-md-6">
                        <label className="form-label">Name</label>
                        <input type="text" name="name" className="form-control" value={form.name} onChange={handleChange} />
                    </div>
                    <div className="col-md-6">
                        <label className="form-label">Type</label>
                        <select name="type" className="form-select" value={form.type} onChange={handleChange}>
                            <option value="automatic">Automatic</option>
                            <option value="one_time">One-Time</option>
                        </select>
                    </div>
                    <div className="col-12">
                        <label className="form-label">Description</label>
                        <input type="text" name="description" className="form-control" value={form.description} onChange={handleChange} />
                    </div>
                    <div className="col-md-6">
                        <label className="form-label">Start Time</label>
                        <input type="datetime-local" name="startTime" className="form-control" value={form.startTime} onChange={handleChange} />
                    </div>
                    <div className="col-md-6">
                        <label className="form-label">End Time</label>
                        <input type="datetime-local" name="endTime" className="form-control" value={form.endTime} onChange={handleChange} />
                    </div>
                    <div className="col-md-4">
                        <label className="form-label">Min Spending</label>
                        <input type="number" name="minSpending" step="0.01" className="form-control" value={form.minSpending ?? ''} onChange={handleChange} />
                    </div>
                    <div className="col-md-4">
                        <label className="form-label">Rate</label>
                        <input type="number" name="rate" step="0.01" className="form-control" value={form.rate ?? ''} onChange={handleChange} />
                    </div>
                    <div className="col-md-4">
                        <label className="form-label">Points</label>
                        <input type="number" name="points" className="form-control" value={form.points ?? ''} onChange={handleChange} />
                    </div>
                    <div className="col-12 d-flex gap-2">
                        <button type="button" className="btn btn-primary" onClick={handleUpdate}>Save</button>
                        <button type="button" className="btn btn-secondary" onClick={handleEditToggle}>Cancel</button>
                    </div>
                </form>
            ) : (
                <div className="card p-3">
                    <h5>{promotion.name}</h5>
                    <p>{promotion.description}</p>
                    <p><strong>Type:</strong> {promotion.type}</p>
                    <p><strong>Start:</strong> {new Date(promotion.startTime).toLocaleString()}</p>
                    <p><strong>End:</strong> {new Date(promotion.endTime).toLocaleString()}</p>
                    <p><strong>Min Spending:</strong> {promotion.minSpending ?? 'N/A'}</p>
                    <p><strong>Rate:</strong> {promotion.rate ?? 'N/A'}</p>
                    <p><strong>Points:</strong> {promotion.points ?? 'N/A'}</p>
                    <div className="d-flex gap-2">
                        <button className="btn btn-warning" onClick={handleEditToggle}>Edit</button>
                        <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
                    </div>
                </div>
            )}
        </div>
    );
}
