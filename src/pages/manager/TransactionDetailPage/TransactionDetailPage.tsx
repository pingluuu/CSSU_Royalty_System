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
    createdBy: string;
    relatedId?: number;
}

export default function TransactionDetailPage() {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [transaction, setTransaction] = useState<Transaction | null>(null);
    const [adjustAmount, setAdjustAmount] = useState(0);
    const [adjustRemark, setAdjustRemark] = useState('');
    const [promotionIds, setPromotionIds] = useState<string>('');
    const [loading, setLoading] = useState(true);

    const fetchTransaction = async () => {
        try {
            const res = await api.get(`/transactions/${id}`);
            setTransaction(res.data);
        } catch (err) {
            console.error('Error fetching transaction', err);
        } finally {
            setLoading(false);
        }
    };

    const toggleSuspicious = async () => {
        try {
            await api.patch(`/transactions/${id}/suspicious`, {
                suspicious: !transaction?.suspicious,
            });
            fetchTransaction();
        } catch (err) {
            console.error('Failed to toggle suspicious flag', err);
        }
    };

    const submitAdjustment = async () => {
        try {
            const promotionIdArray = promotionIds
                .split(',')
                .map(id => id.trim())
                .filter(Boolean)
                .map(Number);

            await api.post('/transactions', {
                utorid: transaction?.utorid,
                type: 'adjustment',
                amount: adjustAmount,
                relatedId: transaction?.id,
                remark: adjustRemark,
                promotionIds: promotionIdArray,
            });
            alert('Adjustment submitted');
            navigate('/all-transactions');
        } catch (err) {
            console.error('Failed to create adjustment', err);
            alert('Failed to create adjustment');
        }
    };

    useEffect(() => {
        if (user?.role === 'manager') {
            fetchTransaction();
        }
    }, [id]);

    if (loading) return <p>Loading...</p>;
    if (!transaction) return <p>Transaction not found</p>;

    return (
        <div className="transaction-detail-container">
            <h2>Transaction #{transaction.id}</h2>
            <p><strong>Type:</strong> {transaction.type}</p>
            <p><strong>User:</strong> {transaction.utorid}</p>
            {transaction.spent !== undefined && <p><strong>Spent:</strong> ${transaction.spent}</p>}
            {transaction.amount !== undefined && <p><strong>Amount:</strong> {transaction.amount}</p>}
            <p><strong>Remark:</strong> {transaction.remark || 'None'}</p>
            <p><strong>Suspicious:</strong> {transaction.suspicious ? 'Yes' : 'No'}</p>
            <p><strong>Created By:</strong> {transaction.createdBy}</p>

            <button onClick={toggleSuspicious} className="btn btn-warning mt-3">
                Mark as {transaction.suspicious ? 'Not Suspicious' : 'Suspicious'}
            </button>

            <hr />
            <h4>Create Adjustment Transaction</h4>
            <div className="mb-3">
                <label className="form-label">Amount (can be negative):</label>
                <input
                    type="number"
                    className="form-control"
                    value={adjustAmount}
                    onChange={(e) => setAdjustAmount(parseInt(e.target.value))}
                />
            </div>
            <div className="mb-3">
                <label className="form-label">Remark:</label>
                <input
                    type="text"
                    className="form-control"
                    value={adjustRemark}
                    onChange={(e) => setAdjustRemark(e.target.value)}
                />
            </div>
            <div className="mb-3">
                <label className="form-label">Promotion IDs (comma-separated):</label>
                <input
                    type="text"
                    className="form-control"
                    value={promotionIds}
                    onChange={(e) => setPromotionIds(e.target.value)}
                />
            </div>
            <button onClick={submitAdjustment} className="btn btn-primary">
                Submit Adjustment
            </button>
        </div>
    );
}
