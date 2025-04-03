import { useState } from 'react';
import api from '../../../services/api';
import { useNavigate } from 'react-router-dom';
import './CreatePromotionPage.css';

export default function CreatePromotionPage() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        type: 'automatic',
        startTime: '',
        endTime: '',
        minSpending: '',
        rate: '',
        points: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload: any = {
                ...formData,
                startTime: new Date(formData.startTime).toISOString(),
                endTime: new Date(formData.endTime).toISOString(),
                minSpending: formData.minSpending ? parseFloat(formData.minSpending) : undefined,
                rate: formData.rate ? parseFloat(formData.rate) : undefined,
                points: formData.points ? parseInt(formData.points) : undefined,
            };
            await api.post('/promotions', payload);
            alert('Promotion created successfully');
            navigate('/promotions-manager');
        } catch (err) {
            console.error('Failed to create promotion:', err);
            alert('Error creating promotion');
        }
    };


    return (
        <div className="container mt-4">
            <h2>Create New Promotion</h2>
            <form onSubmit={handleSubmit} className="row g-3">
                <div className="col-md-6">
                    <label className="form-label">Name</label>
                    <input type="text" className="form-control" name="name" value={formData.name} onChange={handleChange} required />
                </div>

                <div className="col-md-6">
                    <label className="form-label">Type</label>
                    <select className="form-select" name="type" value={formData.type} onChange={handleChange} required>
                        <option value="automatic">automatic</option>
                        <option value="one-time">one-time</option>
                    </select>
                </div>

                <div className="col-12">
                    <label className="form-label">Description</label>
                    <input type="text" className="form-control" name="description" value={formData.description} onChange={handleChange} required />
                </div>

                <div className="col-md-6">
                    <label className="form-label">Start Time (ISO 8601)</label>
                    <input type="datetime-local" className="form-control" name="startTime" value={formData.startTime} onChange={handleChange} required />
                </div>

                <div className="col-md-6">
                    <label className="form-label">End Time (ISO 8601)</label>
                    <input type="datetime-local" className="form-control" name="endTime" value={formData.endTime} onChange={handleChange} required />
                </div>

                <div className="col-md-4">
                    <label className="form-label">Min Spending ($)</label>
                    <input type="number" step="0.01" className="form-control" name="minSpending" value={formData.minSpending} onChange={handleChange} />
                </div>

                <div className="col-md-4">
                    <label className="form-label">Rate (Extra points per $)</label>
                    <input type="number" step="0.01" className="form-control" name="rate" value={formData.rate} onChange={handleChange} />
                </div>

                <div className="col-md-4">
                    <label className="form-label">Points (Fixed bonus)</label>
                    <input type="number" className="form-control" name="points" value={formData.points} onChange={handleChange} />
                </div>

                <div className="col-12">
                    <button type="submit" className="btn btn-success">Create Promotion</button>
                </div>
            </form>
        </div>
    );
}
