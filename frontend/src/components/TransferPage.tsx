import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const TransferPage: React.FC = () => {
  const { user } = useAuth();
  const [recipientUserid, setrecipientUserid] = useState('');
  const [amount, setAmount] = useState('');
  const [remark, setRemark] = useState('');
  const [status, setStatus] = useState<{ message: string; success: boolean } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);

    if (!user?.verified) {
      setStatus({ message: 'Your account must be verified to transfer points.', success: false });
      return;
    }

    // if (recipientUserid === user.userid) {
    //   setStatus({ message: 'You cannot transfer points to yourself.', success: false });
    //   return;
    // }

    try {
      const payload = {
        type: 'transfer',
        amount: parseInt(amount),
        remark: remark || undefined,
      };

      await api.post(`/users/${recipientUserid}/transactions`, payload);
      setStatus({ message: `Success! You transferred ${amount} points to ${recipientUserid}.`, success: true });

      setrecipientUserid('');
      setAmount('');
      setRemark('');
    } catch (err: any) {
      const status = err.response?.status;
      if (status === 403) {
        setStatus({ message: 'You must be verified to transfer points.', success: false });
      } else if (status === 400) {
        setStatus({ message: 'Invalid transfer. You may not have enough points or Invalid Recipient UserId.', success: false });
      } else if (status === 404) {
        setStatus({ message: 'Recipient UserId not found.', success: false });
      } else {
        setStatus({ message: 'Failed to complete transfer.', success: false });
      }
    }
  };

  return (
    <div className="container mt-5 d-flex justify-content-center">
      <div className="card p-4 shadow-sm" style={{ maxWidth: '500px', width: '100%' }}>
        <h2 className="text-center mb-3">Transfer Points</h2>
        <p className="text-muted text-center">Send points to another user by entering their User ID.</p>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Recipient UserID</label>
            <input
              type="text"
              className="form-control"
              value={recipientUserid}
              onChange={(e) => setrecipientUserid(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Amount (points)</label>
            <input
              type="number"
              className="form-control"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              min={1}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Remark (optional)</label>
            <textarea
              className="form-control"
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              rows={2}
            />
          </div>

          <button type="submit" className="btn btn-primary w-100">Transfer</button>
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
    </div>
  );
};

export default TransferPage;