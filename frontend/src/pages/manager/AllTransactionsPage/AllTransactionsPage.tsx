import { useEffect, useState } from 'react';
import { useSearchParams, Link, useLocation} from 'react-router-dom';
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
    purchase: 'transaction-purchase',
    adjustment: 'transaction-adjustment',
    transfer: 'transaction-transfer',
    redemption: 'transaction-redemption',
    event: 'transaction-event',
};

export default function AllTransactionsPage() {
    const { user } = useAuth();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [count, setCount] = useState(0);
    const [limit] = useState(10);
    const [loading, setLoading] = useState(false);
    const link_location = useLocation();

    // Get and update URL search parameters
    const [searchParams, setSearchParams] = useSearchParams();

    // Local filter state; initialize from URL parameters
    const [filterType, setFilterType] = useState(searchParams.get('type') || '');
    const [filterName, setFilterName] = useState(searchParams.get('name') || '');
    const [filterCreatedBy, setFilterCreatedBy] = useState(
        searchParams.get('createdBy') || ''
    );
    const [filterSuspicious, setFilterSuspicious] = useState(
        searchParams.get('suspicious') || ''
    );
    const [filterPromotionId, setFilterPromotionId] = useState(
        searchParams.get('promotionId') || ''
    );
    const [filterRelatedId, setFilterRelatedId] = useState(
        searchParams.get('relatedId') || ''
    );
    const [filterAmount, setFilterAmount] = useState(searchParams.get('amount') || '');
    const [filterOperator, setFilterOperator] = useState(
        searchParams.get('operator') || ''
    );
    const [page, setPage] = useState<number>(() => {
        const param = searchParams.get('page');
        return param ? parseInt(param, 10) : 1;
    });

    // Fetch transactions based on filters and pagination
    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const params: any = {
                page,
                limit,
            };

            if (filterType) params.type = filterType;
            if (filterName) params.name = filterName;
            if (filterCreatedBy) params.createdBy = filterCreatedBy;
            if (filterSuspicious !== '') params.suspicious = filterSuspicious;
            if (filterPromotionId) params.promotionId = parseInt(filterPromotionId);
            if (filterRelatedId) params.relatedId = parseInt(filterRelatedId);
            if (filterAmount && filterOperator) {
                params.amount = parseInt(filterAmount);
                params.operator = filterOperator;
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

    // Keep local filter state and page number in sync with URL parameters.
    useEffect(() => {
        setFilterType(searchParams.get('type') || '');
        setFilterName(searchParams.get('name') || '');
        setFilterCreatedBy(searchParams.get('createdBy') || '');
        setFilterSuspicious(searchParams.get('suspicious') || '');
        setFilterPromotionId(searchParams.get('promotionId') || '');
        setFilterRelatedId(searchParams.get('relatedId') || '');
        setFilterAmount(searchParams.get('amount') || '');
        setFilterOperator(searchParams.get('operator') || '');
        setPage(searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : 1);
        fetchTransactions();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams]);

    const totalPages = Math.ceil(count / limit);

    // Handle filter submission: update URL query parameters which then trigger a fetch.
    const handleFilterSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const params: Record<string, string> = {};
        if (filterType) params.type = filterType;
        if (filterName) params.name = filterName;
        if (filterCreatedBy) params.createdBy = filterCreatedBy;
        if (filterSuspicious) params.suspicious = filterSuspicious;
        if (filterPromotionId) params.promotionId = filterPromotionId;
        if (filterRelatedId) params.relatedId = filterRelatedId;
        if (filterAmount) params.amount = filterAmount;
        if (filterOperator) params.operator = filterOperator;
        // Reset page to 1 on new filter submission
        params.page = '1';
        params.limit = limit.toString();
        setSearchParams(params);
    };

    // Update URL query parameters for pagination while preserving current filters.
    const handlePageChange = (newPage: number) => {
        const currentParams = Object.fromEntries([...searchParams]);
        currentParams.page = newPage.toString();
        setSearchParams(currentParams);
    };

    if (user?.role !== 'manager') {
        return <p>You are not authorized to view this page.</p>;
    }

    return (
        <div className="container mt-4">
            <h2 className="mb-3">All Transactions</h2>

            {/* Custom grid-based filter form, now set for two filters per row */}
            <form className="filter-form mb-4" onSubmit={handleFilterSubmit}>
                <div>
                    <label className="form-label">Type</label>
                    <select
                        className="form-select"
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                    >
                        <option value="">All</option>
                        <option value="purchase">Purchase</option>
                        <option value="adjustment">Adjustment</option>
                        <option value="transfer">Transfer</option>
                        <option value="redemption">Redemption</option>
                        <option value="event">Event</option>
                    </select>
                </div>
                <div>
                    <label className="form-label">User Name/UTORid</label>
                    <input
                        type="text"
                        className="form-control"
                        value={filterName}
                        onChange={(e) => setFilterName(e.target.value)}
                    />
                </div>
                <div>
                    <label className="form-label">Created By</label>
                    <input
                        type="text"
                        className="form-control"
                        value={filterCreatedBy}
                        onChange={(e) => setFilterCreatedBy(e.target.value)}
                    />
                </div>
                <div>
                    <label className="form-label">Suspicious</label>
                    <select
                        className="form-select"
                        value={filterSuspicious}
                        onChange={(e) => setFilterSuspicious(e.target.value)}
                    >
                        <option value="">All</option>
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                    </select>
                </div>
                <div>
                    <label className="form-label">Amount</label>
                    <input
                        type="number"
                        className="form-control"
                        value={filterAmount}
                        onChange={(e) => setFilterAmount(e.target.value)}
                    />
                </div>
                <div>
                    <label className="form-label">Operator</label>
                    <select
                        className="form-select"
                        value={filterOperator}
                        onChange={(e) => setFilterOperator(e.target.value)}
                    >
                        <option value="">None</option>
                        <option value="gte">≥</option>
                        <option value="lte">≤</option>
                    </select>
                </div>
                <div>
                    <label className="form-label">Promo ID</label>
                    <input
                        type="number"
                        className="form-control"
                        value={filterPromotionId}
                        onChange={(e) => setFilterPromotionId(e.target.value)}
                    />
                </div>
                <div>
                    <label className="form-label">Related ID</label>
                    <input
                        type="number"
                        className="form-control"
                        value={filterRelatedId}
                        onChange={(e) => setFilterRelatedId(e.target.value)}
                    />
                </div>
                {/* Adjusted button container to span 2 columns for a two-column layout */}
                <div style={{ gridColumn: 'span 2', textAlign: 'start' }}>
                    <button type="submit" className="btn btn-primary">
                        Apply Filters
                    </button>
                </div>
            </form>

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
                            className={`transaction-card ${typeColors[tx.type] || ''} ${tx.suspicious ? 'transaction-suspicious' : ''
                                }`}
                            style={{ textDecoration: 'none', color: 'inherit' }} state={{ from: link_location }}
                        >
                            <h5>Transaction #{tx.id}</h5>
                            <p>
                                <strong>Type:</strong> {tx.type}
                                <br />
                                <strong>User:</strong> {tx.utorid}
                                <br />
                                {tx.spent !== undefined && (
                                    <>
                                        <strong>Spent:</strong> ${tx.spent}
                                        <br />
                                    </>
                                )}
                                {tx.amount !== undefined && (
                                    <>
                                        <strong>Amount:</strong> {tx.amount}
                                        <br />
                                    </>
                                )}
                                {tx.relatedId && (
                                    <>
                                        <strong>Related:</strong> {tx.relatedId}
                                        <br />
                                    </>
                                )}
                                {tx.remark && (
                                    <>
                                        <strong>Remark:</strong> {tx.remark}
                                        <br />
                                    </>
                                )}
                                <strong>Suspicious:</strong> {tx.suspicious ? 'Yes' : 'No'}
                                <br />
                                <strong>Created By:</strong> {tx.createdBy}
                            </p>
                        </Link>
                    ))}
                    <div className="pagination-controls">
                        <button
                            type="button"
                            className="btn btn-outline-primary"
                            onClick={() => handlePageChange(Math.max(page - 1, 1))}
                            disabled={page === 1}
                        >
                            Previous
                        </button>
                        <span>
                            Page {page} of {totalPages}
                        </span>
                        <button
                            type="button"
                            className="btn btn-outline-primary"
                            onClick={() => handlePageChange(Math.min(page + 1, totalPages))}
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
