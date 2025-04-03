import { useEffect, useState } from 'react';
import api from '../../../services/api';
import { useAuth } from '../../../contexts/AuthContext';
import './AllTransactionsPage.css';
import { Link } from 'react-router-dom';


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
    purchase: 'transaction-purchase',
    adjustment: 'transaction-adjustment',
    transfer: 'transaction-transfer',
    redemption: 'transaction-redemption',
    event: 'transaction-event',
};

export default function AllTransactionsPage() {
    const { user } = useAuth();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [page, setPage] = useState(1);
    const [count, setCount] = useState(0);
    const [limit] = useState(10);
    const [loading, setLoading] = useState(false);

    // Filters
    const [filterType, setFilterType] = useState('');
    const [sortBy, setSortBy] = useState('');

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const params: any = {
                page,
                limit,
            };

            if (filterType) params.type = filterType;
            if (sortBy.includes('amount')) {
                params.amount = 0;
                params.operator = sortBy.endsWith('asc') ? 'gte' : 'lte';
            }

            const res = await api.get('/transactions', { params });
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
            <h2 className="mb-3">All Transactions</h2>

            {/* Filters */}
            <form className="mb-4 d-flex gap-3 align-items-end" onSubmit={(e) => { e.preventDefault(); fetchTransactions(); }}>
                <div>
                    <label className="form-label">Type:</label>
                    <select className="form-select" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                        <option value="">All</option>
                        <option value="purchase">Purchase</option>
                        <option value="adjustment">Adjustment</option>
                        <option value="transfer">Transfer</option>
                        <option value="redemption">Redemption</option>
                        <option value="event">Event</option>
                    </select>
                </div>
                <div>
                    <label className="form-label">Order by:</label>
                    <select className="form-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                        <option value="">Default</option>
                        <option value="amount_asc">Amount ↑</option>
                        <option value="amount_desc">Amount ↓</option>
                    </select>
                </div>
                <button type="submit" className="btn btn-primary">Apply</button>
            </form>

            {/* Content */}
            {loading ? (
                <p>Loading...</p>
            ) : transactions.length === 0 ? (
                <p>No transactions found.</p>
            ) : (
                <>
                    {transactions.map((tx) => (
                        <Link
                            key={tx.id}
                            to={`/transactions/${tx.id}`}
                            className={`transaction-card ${typeColors[tx.type] || ''} ${tx.suspicious ? 'transaction-suspicious' : ''}`}
                            style={{ textDecoration: 'none', color: 'inherit' }}
                        >
                            <h5>Transaction #{tx.id}</h5>
                            <p>
                                <strong>Type:</strong> {tx.type}<br />
                                <strong>User:</strong> {tx.utorid}<br />
                                {tx.spent !== undefined && <><strong>Spent:</strong> ${tx.spent}<br /></>}
                                {tx.amount !== undefined && <><strong>Amount:</strong> {tx.amount}<br /></>}
                                {tx.relatedId && <><strong>Related:</strong> {tx.relatedId}<br /></>}
                                {tx.remark && <><strong>Remark:</strong> {tx.remark}<br /></>}
                                <strong>Suspicious:</strong> {tx.suspicious ? 'Yes' : 'No'}<br />
                                <strong>Created By:</strong> {tx.createdBy}
                            </p>
                        </Link>
                    ))}

                    <div className="pagination-controls">
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
