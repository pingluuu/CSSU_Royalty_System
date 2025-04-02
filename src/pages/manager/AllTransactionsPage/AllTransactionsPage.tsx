import { useEffect, useState } from 'react';
import api from '../../../services/api';
import { useAuth } from '../../../contexts/AuthContext';
import './AllTransactionsPage.css';

interface Transaction {
    id: number;
    utorid: string;
    type: string;
    spent?: number;
    amount?: number;
    remark?: string;
    promotionIds?: number[];
    relatedId?: number | string | null;
    suspicious: boolean;
    createdBy: string;
}

const typeColors: Record<string, string> = {
    purchase: 'bg-success text-white',
    adjustment: 'bg-warning text-dark',
    transfer: 'bg-info text-dark',
    redemption: 'bg-danger text-white',
    event: 'bg-secondary text-white',
};

export default function AllTransactionsPage() {
    const { user } = useAuth();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [page, setPage] = useState(1);
    const [count, setCount] = useState(0);
    const [limit] = useState(10);
    const [loading, setLoading] = useState(false);

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/transactions?page=${page}&limit=${limit}`);
            setTransactions(res.data.results);
            setCount(res.data.count);
        } catch (error) {
            console.error('Error fetching transactions:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.role === 'manager') {
            fetchTransactions();
        }
    }, [page]);

    const totalPages = Math.ceil(count / limit);

    return (
        <div className="container mt-4">
            <h2>All Transactions</h2>
            {loading ? (
                <p>Loading...</p>
            ) : (
                <>
                    {transactions.map((tx) => (
                        <div
                            key={tx.id}
                            className={`card mb-3 transaction-card ${typeColors[tx.type] || 'bg-light'} ${tx.suspicious ? 'transaction-suspicious' : ''}`}
                        >

                            <div className="card-body">
                                <h5 className="card-title">Transaction #{tx.id}</h5>
                                <p className="card-text">
                                    <strong>Type:</strong> {tx.type}<br />
                                    <strong>User:</strong> {tx.utorid}<br />
                                    {tx.spent !== undefined && <><strong>Spent:</strong> ${tx.spent}<br /></>}
                                    {tx.amount !== undefined && <><strong>Amount:</strong> {tx.amount}<br /></>}
                                    {tx.relatedId && <><strong>Related:</strong> {tx.relatedId}<br /></>}
                                    {tx.remark && <><strong>Remark:</strong> {tx.remark}<br /></>}
                                    <strong>Suspicious:</strong> {tx.suspicious ? 'Yes' : 'No'}<br />
                                    <strong>Created By:</strong> {tx.createdBy}
                                </p>
                            </div>
                        </div>
                    ))}
                    <div className="d-flex justify-content-between align-items-center mt-4">
                        <button
                            type="button"
                            className="btn btn-outline-primary"
                            onClick={() => setPage((p) => Math.max(p - 1, 1))}
                            disabled={page === 1}
                        >
                            Previous
                        </button>
                        <span>Page {page} of {totalPages}</span>
                        <button
                            type="button"
                            className="btn btn-outline-primary"
                            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                            disabled={page === totalPages}
                        >
                            Next
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
