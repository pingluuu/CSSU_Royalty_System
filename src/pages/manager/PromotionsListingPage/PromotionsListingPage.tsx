import { useEffect, useState } from 'react';
import api from '../../../services/api';
import { useAuth } from '../../../contexts/AuthContext';
import { Link } from 'react-router-dom';

interface Promotion {
    id: number;
    name: string;
    description: string;
    type: string;
    startTime: string;
    endTime: string;
    minSpending?: number;
    rate?: number;
    points?: number;
}

export default function PromotionsListingPage() {
    const { user } = useAuth();
    const [promotions, setPromotions] = useState<Promotion[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStarted, setFilterStarted] = useState('');
    const [filterEnded, setFilterEnded] = useState('');

    const fetchPromotions = async () => {
        setLoading(true);
        try {
            const params: any = {};
            if (filterStarted) params.started = filterStarted === 'true';
            if (filterEnded) params.ended = filterEnded === 'true';

            const res = await api.get('/promotions', { params });
            setPromotions(res.data.results);
        } catch (err) {
            console.error('Error fetching promotions:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.role === 'manager') {
            fetchPromotions();
        }
    }, [filterStarted, filterEnded]);

    return (
        <div className="container mt-4">
            <h2>All Promotions</h2>

            <div className="row mb-3">
                <div className="col-md-6">
                    <label className="form-label">Filter Started</label>
                    <select
                        className="form-select"
                        value={filterStarted}
                        onChange={(e) => setFilterStarted(e.target.value)}
                    >
                        <option value="">All</option>
                        <option value="true">Started</option>
                        <option value="false">Not Started</option>
                    </select>
                </div>
                <div className="col-md-6">
                    <label className="form-label">Filter Ended</label>
                    <select
                        className="form-select"
                        value={filterEnded}
                        onChange={(e) => setFilterEnded(e.target.value)}
                    >
                        <option value="">All</option>
                        <option value="true">Ended</option>
                        <option value="false">Not Ended</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <p>Loading...</p>
            ) : (
                <div className="list-group">
                    {promotions.map((promo) => (
                        <Link
                            key={promo.id}
                            to={`/manager/promotions/${promo.id}`}
                            className="list-group-item list-group-item-action"
                        >
                            <div className="d-flex w-100 justify-content-between">
                                <h5 className="mb-1">{promo.name}</h5>
                                <small>{new Date(promo.startTime).toLocaleDateString()}</small>
                            </div>
                            <p className="mb-1">{promo.description}</p>
                            <small>Type: {promo.type} | Ends: {new Date(promo.endTime).toLocaleDateString()}</small>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}