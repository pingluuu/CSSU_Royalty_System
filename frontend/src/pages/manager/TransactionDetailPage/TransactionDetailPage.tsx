import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import { useAuth } from '../../../contexts/AuthContext';

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
        .map((id) => id.trim())
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

  if (loading) return <div className="container mt-5">Loading...</div>;
  if (!transaction) return <div className="container mt-5">Transaction not found</div>;

  return (
    <div className="container mt-5" style={{ maxWidth: '750px' }}>
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body">
          <h3 className="card-title mb-3">Transaction #{transaction.id}</h3>
          <div className="row mb-2">
            <div className="col-md-6"><strong>Type:</strong> {transaction.type}</div>
            <div className="col-md-6"><strong>User:</strong> {transaction.utorid}</div>
          </div>
          {transaction.spent !== undefined && (
            <div className="mb-2"><strong>Spent:</strong> ${transaction.spent}</div>
          )}
          {transaction.amount !== undefined && (
            <div className="mb-2"><strong>Amount:</strong> {transaction.amount}</div>
          )}
          <div className="mb-2"><strong>Remark:</strong> {transaction.remark || 'None'}</div>
          <div className="mb-2"><strong>Suspicious:</strong> {transaction.suspicious ? 'Yes' : 'No'}</div>
          <div className="mb-2"><strong>Created By:</strong> {transaction.createdBy}</div>
          <button onClick={toggleSuspicious} className="btn btn-warning mt-3">
            Mark as {transaction.suspicious ? 'Not Suspicious' : 'Suspicious'}
          </button>
        </div>
      </div>

      <div className="card shadow-sm border-0 bg-light">
        <div className="card-body">
          <h4 className="card-title mb-4">Create Adjustment</h4>
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
          <button onClick={submitAdjustment} className="btn btn-primary w-100">
            Submit Adjustment
          </button>
        </div>
      </div>
    </div>
  );
}
