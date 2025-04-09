import { useState } from 'react';
import api from '../../../services/api';
import { useAuth } from '../../../contexts/AuthContext';

export default function ProcessRedemptionPage() {
    const { user } = useAuth();
    const [transactionId, setTransactionId] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');
        setError('');

        if (!transactionId) {
            setError('Please enter a valid transaction ID.');
            return;
        }

        try {
            await api.patch(`/transactions/${transactionId}/processed`, { processed: true });
            setMessage(`Transaction #${transactionId} has been successfully processed.`);
            setTransactionId('');
        } catch (err: any) {
            const backendMessage = err.response?.data?.message;
            const status = err.response?.status;

            if (backendMessage) {
                setError(backendMessage); // show backend-provided message
            } else if (status === 400) {
                setError('Invalid transaction ID or the transaction is not a redemption or has already been processed.');
            } else if (status === 403) {
                setError('You do not have permission to process this transaction.');
            } else if (status === 404) {
                setError('Transaction not found.');
            } else {
                setError('An unexpected error occurred.');
            }
        }
    };

    if (user?.role !== 'cashier' && user?.role !== 'manager' && user?.role !== 'superuser') {
        return <div className="container mt-4">You do not have access to this page.</div>;
    }

    return (
        <div className="container mt-4">
            <h2>Process Redemption Request</h2>
            <form onSubmit={handleSubmit} className="mb-3">
                <div className="mb-3">
                    <label className="form-label">Transaction ID</label>
                    <input
                        type="number"
                        className="form-control"
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" className="btn btn-primary">Process</button>
            </form>

            {message && <div className="alert alert-success">{message}</div>}
            {error && <div className="alert alert-danger">{error}</div>}

        </div>
    );
}
