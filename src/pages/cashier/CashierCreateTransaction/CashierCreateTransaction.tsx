import React, { useState } from 'react';
import api from '../../../services/api';

const CreateTransaction: React.FC = () => {
  const [utorid, setUtorid] = useState('');
  const [spent, setSpent] = useState('');
  const [promotionIds, setPromotionIds] = useState('');
  const [remark, setRemark] = useState('');
  const [status, setStatus] = useState<{ message: string; success: boolean } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const payload = {
        utorid,
        type: 'purchase',
        spent: parseFloat(spent),
        promotionIds: promotionIds
          ? promotionIds.split(',').map((id) => parseInt(id.trim()))
          : undefined,
        remark: remark || undefined,
      };

      const response = await api.post('/transactions', payload);
      setStatus({ message: `Success! Transaction #${response.data.id} created.`, success: true });

      setUtorid('');
      setSpent('');
      setPromotionIds('');
      setRemark('');
    } catch (error: any) {
      console.error(error);
      setStatus({ message: 'Failed to create transaction.', success: false });
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: '600px' }}>
      <h2>Create Purchase Transaction</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="utorid" className="form-label">Customer UTORid</label>
          <input
            type="text"
            className="form-control"
            id="utorid"
            value={utorid}
            onChange={(e) => setUtorid(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="spent" className="form-label">Amount Spent ($)</label>
          <input
            type="number"
            step="0.01"
            className="form-control"
            id="spent"
            value={spent}
            onChange={(e) => setSpent(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="promotions" className="form-label">Promotion IDs (comma-separated)</label>
          <input
            type="text"
            className="form-control"
            id="promotions"
            value={promotionIds}
            onChange={(e) => setPromotionIds(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <label htmlFor="remark" className="form-label">Remark (optional)</label>
          <textarea
            className="form-control"
            id="remark"
            rows={2}
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
          />
        </div>

        <button type="submit" className="btn btn-primary">Create Transaction</button>
      </form>

      {status && (
        <div
          className="alert mt-3"
          role="alert"
          style={{
            backgroundColor: status.success ? '#e7f1ff' : '#ffe7e7',
            color: status.success ? '#0d6efd' : '#dc3545',
            border: `1px solid ${status.success ? '#0d6efd' : '#dc3545'}`,
          }}
        >
          {status.message}
        </div>
      )}
    </div>
  );
};

export default CreateTransaction;