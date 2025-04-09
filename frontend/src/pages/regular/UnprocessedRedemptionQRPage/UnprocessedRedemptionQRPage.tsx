import { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import api from '../../../services/api';
import { QRCodeCanvas } from 'qrcode.react';

export default function UserRedemptionQRCodePage() {
    const { user } = useAuth();
    const [amount, setAmount] = useState('');
    const [remark, setRemark] = useState('');
    const [qrData, setQrData] = useState('');
    const [error, setError] = useState('');
    const [successTxId, setSuccessTxId] = useState<number | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setQrData('');
        setSuccessTxId(null);

        try {
            const payload = {
                type: 'redemption',
                amount: parseInt(amount),
                remark: remark || undefined,
            };
            const res = await api.post('/users/me/transactions', payload);
            const tx = res.data;

            setSuccessTxId(tx.id);
            setQrData(JSON.stringify({
                transactionId: tx.id,
                utorid: user?.utorid,
                type: tx.type,
            }));
        } catch (err: any) {
            const status = err.response?.status;
            if (status === 400) {
                setError('Requested amount exceeds your available points.');
            } else if (status === 403) {
                setError('You must be a verified user to make a redemption request.');
            } else {
                setError('Something went wrong. Please try again later.');
            }
        }
    };

    if (!user) return <div className="container mt-4">You must be logged in.</div>;

    return (
        <div className="container mt-4">
            <h2>Redemption Request</h2>
            <form onSubmit={handleSubmit} className="mb-4">
                <div className="mb-3">
                    <label className="form-label">Amount to Redeem</label>
                    <input
                        type="number"
                        className="form-control"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        min={1}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">Remark (Optional)</label>
                    <input
                        type="text"
                        className="form-control"
                        value={remark}
                        onChange={(e) => setRemark(e.target.value)}
                    />
                </div>
                <button type="submit" className="btn btn-primary" style={{backgroundColor: "#0d6efd"}}>Submit Redemption Request</button>
            </form>

            {error && <div className="alert alert-danger">{error}</div>}

            {qrData && (
                <div className="text-center">
                    <h4>Redemption QR Code (Transaction #{successTxId})</h4>
                    <QRCodeCanvas value={qrData} size={256} />
                    <p className="mt-2">Show this code to a cashier to process your redemption.</p>
                </div>
            )}
        </div>
    );
}
