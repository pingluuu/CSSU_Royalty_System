import { useAuth } from '../contexts/AuthContext';
import { useEffect, useState } from 'react';
import api from '../services/api';
import { Link } from 'react-router-dom';
import AvailablePoints from './AvailablePoints';

export default function LandingPage() {
    const { user } = useAuth();
    const [points, setPoints] = useState<number | null>(null);
    const [transactions, setTransactions] = useState<any[]>([]);

    useEffect(() => {
        const fetchUserData = async () => {
            if (user?.role === 'regular') {
                try {
                    const userRes = await api.get('/users/me');
                    setPoints(userRes.data.points);
                    const txRes = await api.get('/transactions', { params: { page: 1, limit: 5 } });
                    setTransactions(txRes.data.results);
                } catch (err) {
                    console.error('Failed to fetch user data:', err);
                }
            }
        };
        fetchUserData();
    }, [user]);

    if (!user) return <div className="container mt-4">Loading...</div>;

    return (
        <div className="container mt-4">
            <h2>Welcome, {user.name}</h2>

            {user.role === 'regular' && (
                <>
                    <AvailablePoints />
                    <div className="mt-4">
                    <h5 className="mt-4">Recent Transactions</h5>
                    <ul className="list-group">
                        {transactions.map(tx => (
                            <li key={tx.id} className="list-group-item">
                                #{tx.id} - {tx.type} - {tx.amount ?? tx.spent} points
                            </li>
                        ))}
                    </ul>
                    </div>
                </>
            )}

            {user.role === 'cashier' && (
                <>
                    <h4>Cashier Dashboard</h4>
                    <div className="mt-3">
                        <Link to="/create-transaction-cashier" className="btn btn-primary me-2">Create Transaction</Link>
                        <Link to="/process-redemption" className="btn btn-warning">Process Redemption</Link>
                    </div>
                </>
            )}

            {(user.role === 'manager' || user.role === 'superuser') && (
                <>
                    <h4>Admin Dashboard</h4>
                    <div className="row mt-3">
                        <div className="col-md-4">
                            <Link to="/events-manager" className="btn btn-outline-info w-100 mb-2">Manage Events</Link>
                            <Link to="/create-event" className="btn btn-outline-secondary w-100 mb-2">Create New Event</Link>
                        </div>
                        <div className="col-md-4">
                            <Link to="/promotions-manager" className="btn btn-outline-success w-100 mb-2">Manage Promotions</Link>
                            <Link to="/create-promotion" className="btn btn-outline-secondary w-100 mb-2">Create Promotion</Link>
                        </div>
                        <div className="col-md-4">
                            <Link to="/promote" className="btn btn-outline-dark w-100 mb-2">User Management</Link>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
