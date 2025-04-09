import React, { useState } from 'react';
import api from '../../../services/api';
import QrScanner from '../../../components/QrScanner'; 

const CreateTransaction: React.FC = () => {
  const [type, setType] = useState<'purchase' | 'adjustment'>('purchase');
  const [utorid, setUtorid] = useState('');
  const [spent, setSpent] = useState('');
  const [amount, setAmount] = useState('');
  const [relatedId, setRelatedId] = useState('');
  const [promotionIds, setPromotionIds] = useState('');
  const [remark, setRemark] = useState('');
  const [status, setStatus] = useState<{ message: string; success: boolean } | null>(null);
  const [showScanner, setShowScanner] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);

    try {
      const basePayload: any = {
        utorid,
        type,
        remark: remark || undefined,
        promotionIds: promotionIds
          ? promotionIds.split(',').map((id) => parseInt(id.trim()))
          : undefined,
      };

      if (type === 'purchase') {
        basePayload.spent = parseFloat(spent);
      } else if (type === 'adjustment') {
        basePayload.amount = parseInt(amount);
        basePayload.relatedId = parseInt(relatedId);
      }

      const response = await api.post('/transactions', basePayload);
      setStatus({ message: `Success! Transaction #${response.data.id} created.`, success: true });

      setUtorid('');
      setSpent('');
      setAmount('');
      setRelatedId('');
      setPromotionIds('');
      setRemark('');
    } catch (error: any) {
      console.error(error);
      setStatus({ message: 'Failed to create transaction.', success: false });
    }
  };

  const handleQrScan = (result: string) => {
    try {
      const parsed = JSON.parse(result);
      if (parsed.utorid) {
        setUtorid(parsed.utorid);
        setStatus({ message: `Scanned UTORid: ${parsed.utorid}`, success: true });
      } else {
        setStatus({ message: 'Invalid QR code: UTORid missing.', success: false });
      }
    } catch {
      setStatus({ message: 'Invalid QR format.', success: false });
    }
    setShowScanner(false);
  };

  return (
    <div className="container mt-5" style={{ maxWidth: '600px' }}>
      <h2>Create Transaction</h2>
      <form onSubmit={handleSubmit}>
        {/* Transaction Type */}
        <div className="mb-3">
          <label className="form-label">Transaction Type</label>
          <select
            className="form-select"
            value={type}
            onChange={(e) => setType(e.target.value as 'purchase' | 'adjustment')}
          >
            <option value="purchase">Purchase</option>
            <option value="adjustment">Adjustment</option>
          </select>
        </div>

        {/* UTORid + QR */}
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
          <button
            type="button"
            className="btn btn-outline-secondary mt-2"
            onClick={() => setShowScanner((prev) => !prev)}
          >
            {showScanner ? 'Cancel Scanner' : 'Scan QR Code'}
          </button>
          {showScanner && (
            <div className="mt-3">
              <QrScanner
                onScanSuccess={handleQrScan}
                onClose={() => setShowScanner(false)}
              />
            </div>
          )}
        </div>

        {/* Purchase Fields */}
        {type === 'purchase' && (
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
        )}

        {/* Adjustment Fields */}
        {type === 'adjustment' && (
          <>
            <div className="mb-3">
              <label htmlFor="amount" className="form-label">Adjustment Amount (points)</label>
              <input
                type="number"
                className="form-control"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="relatedId" className="form-label">Related Transaction ID</label>
              <input
                type="number"
                className="form-control"
                id="relatedId"
                value={relatedId}
                onChange={(e) => setRelatedId(e.target.value)}
                required
              />
            </div>
          </>
        )}

        {/* Promotions */}
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

        {/* Remark */}
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

        <button type="submit" className="btn btn-primary w-100">Create Transaction</button>
      </form>

      {status && (
        <div
          className="mt-3 p-3 rounded"
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