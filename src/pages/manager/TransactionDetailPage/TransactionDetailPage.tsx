import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import { useAuth } from '../../../contexts/AuthContext';
//import './TransactionDetailPage.css';

interface Transaction {
    id: number;
    utorid: string;
    type: string;
    spent?: number;
    amount?: number;
    remark?: string;
    suspicious: boolean;
    relatedId?: number;
    promotionIds?: number[];
    createdBy: string;
}

export default function TransactionDetailPage() {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [transaction, setTransaction] = useState<Transaction | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [toggleLoading, setToggleLoading] = useState(false);

    const fetchTransaction = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/transactions/${id}`);
            setTransaction(res.data);
        } catch (err) {
            setError('Failed to load transaction.');
        } finally {
            setLoading(false);
        }
    };

    const toggleSuspicious = async () => {
        if (!transaction) return;
        try {
            setToggleLoading(true);
            const res = await api.patch(`/transactions/${transaction.id}/suspicious`, {
                suspicious: !transaction.suspicious,
            });
            setTransaction({ ...transaction, suspicious: res.data.suspicious });
        } catch (err) {
            alert('Failed to update suspicious status.');
        } finally {
            setToggleLoading(false);
        }
    };

    useEffect(() => {
        if (user?.role === 'manager') {
            fetchTransaction();
        }
    }, [id]);

    if (loading) return <p className="container mt-4">Loading...</p>;
    if (error) return <p className="container mt-4 text-danger">{error}</p>;
    if (!transaction) return <p className="container mt-4">Transaction not found.</p>;

    return (
        <div className="container mt-4">
            <h2>Transaction Detail</h2>
            <div className="transaction-detail-card">
                <p><strong>ID:</strong> {transaction.id}</p>
                <p><strong>Type:</strong> {transaction.type}</p>
                <p><strong>User:</strong> {transaction.utorid}</p>
                {transaction.spent !== undefined && <p><strong>Spent:</strong> ${transaction.spent}</p>}
                {transaction.amount !== undefined && <p><strong>Amount:</strong> {transaction.amount}</p>}
                {transaction.relatedId && <p><strong>Related:</strong> {transaction.relatedId}</p>}
                {transaction.remark && <p><strong>Remark:</strong> {transaction.remark}</p>}
                <p><strong>Created By:</strong> {transaction.createdBy}</p>
                <p>
                    <strong>Suspicious:</strong> {transaction.suspicious ? 'Yes' : 'No'}{' '}
                    <button
                        type="button"
                        className={`btn btn-sm ms-3 ${transaction.suspicious ? 'btn-success' : 'btn-danger'}`}
                        onClick={toggleSuspicious}
                        disabled={toggleLoading}
                    >
                        {toggleLoading ? 'Updating...' : transaction.suspicious ? 'Mark as Not Suspicious' : 'Mark as Suspicious'}
                    </button>
                </p>
            </div>

            {/* Optional: Link to adjustment form */}
            {transaction.type === 'purchase' && (
                <button
                    className="btn btn-outline-secondary mt-3"
                    onClick={() => navigate(`/transactions/${transaction.id}/adjustment`)}
                >
                    Create Adjustment Transaction
                </button>
            )}
        </div>
    );
}
