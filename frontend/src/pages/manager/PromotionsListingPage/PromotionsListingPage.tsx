import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../../../services/api';
import { useAuth } from '../../../contexts/AuthContext';
//import './AllTransactionsPage.css';

interface Promotion {
    id: number;
    name: string;
    description: string;
    type: string;
    startTime: string;
    endTime: string;
    minSpending?: number;
    rate?: number;
    points?: number;
}

export default function PromotionsListingPage() {
    const { user } = useAuth();
    const [promotions, setPromotions] = useState<Promotion[]>([]);
    const [count, setCount] = useState(0);
    const [loading, setLoading] = useState(false);

    // Get and update URL search parameters
    const [searchParams, setSearchParams] = useSearchParams();

    // Local filter state; initialize from URL parameters
    const [filterName, setFilterName] = useState(searchParams.get('name') || '');
    const [filterType, setFilterType] = useState(searchParams.get('type') || '');
    const [filterStarted, setFilterStarted] = useState(searchParams.get('started') || '');
    const [filterEnded, setFilterEnded] = useState(searchParams.get('ended') || '');

    const initLimit = parseInt(searchParams.get("limit") || "10", 10);
    const [limit, setLimit] = useState(initLimit);

    const [page, setPage] = useState<number>(() => {
        const param = searchParams.get('page');
        return param ? parseInt(param, 10) : 1;
    });

    // Fetch promotions based on filters and pagination
    const fetchPromotions = async () => {
        setLoading(true);
        try {
            const params: any = {
                page,
                limit,
            };

            if (filterName) params.name = filterName;
            if (filterType) params.type = filterType;
            if (filterStarted) params.started = filterStarted === 'true';
            if (filterEnded) params.ended = filterEnded === 'true';

            const res = await api.get('/promotions', { params });
            setPromotions(res.data.results);
            setCount(res.data.count);
        } catch (err) {
            console.error('Error fetching promotions:', err);
        } finally {
            setLoading(false);
        }
    };

    // Sync local filter state and page with URL query parameters, then fetch data
    useEffect(() => {
        setFilterName(searchParams.get('name') || '');
        setFilterType(searchParams.get('type') || '');
        setFilterStarted(searchParams.get('started') || '');
        setFilterEnded(searchParams.get('ended') || '');
        setPage(searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : 1);
        fetchPromotions();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams]);

    const totalPages = Math.ceil(count / limit);

    // Handle filter submission: update URL query parameters which then trigger a fetch.
    const handleFilterSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const params: Record<string, string> = {};
        if (filterName) params.name = filterName;
        if (filterType) params.type = filterType;
        if (filterStarted) params.started = filterStarted;
        if (filterEnded) params.ended = filterEnded;
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

    if (user?.role !== 'manager' && user?.role !== 'superuser') {
        return <p>You are not authorized to view this page.</p>;
    }

    return (
        <div className="container mt-4">
            <h2 className="mb-3">All Promotions</h2>

            {/* Two-column filter form */}
            <form className="mb-4" onSubmit={handleFilterSubmit}>
                <div className="row">
                    <div className="col-md-6">
                        <label className="form-label">Name</label>
                        <input
                            type="text"
                            className="form-control"
                            value={filterName}
                            onChange={(e) => setFilterName(e.target.value)}
                        />
                    </div>
                    <div className="col-md-6">
                        <label className="form-label">Type</label>
                        <select
                            className="form-select"
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                        >
                            <option value="">All</option>
                            <option value="one-time">one-time</option>
                            <option value="automatic">automatic</option>
                        </select>
                    </div>
                    <div className="col-md-4">
                        <label className="form-label">Started</label>
                        <select
                            className="form-select"
                            value={filterStarted}
                            onChange={(e) => setFilterStarted(e.target.value)}
                        >
                            <option value="">All</option>
                            <option value="true">Started</option>
                            <option value="false">Not Started</option>
                        </select>
                    </div>
                    <div className="col-md-4">
                        <label className="form-label">Ended</label>
                        <select
                            className="form-select"
                            value={filterEnded}
                            onChange={(e) => setFilterEnded(e.target.value)}
                        >
                            <option value="">All</option>
                            <option value="true">Ended</option>
                            <option value="false">Not Ended</option>
                        </select>
                    </div>
                    <div className="col-md-4">
                        <label className="form-label me-2">Results per page:</label>
                        <div className="d-flex">
                        <select
                            className="form-select"
                            value={limit}
                            onChange={(e) => {
                            setLimit(parseInt(e.target.value, 10));
                            }}
                        >
                            <option value="5">5</option>
                            <option value="10">10</option>
                            <option value="25">25</option>
                            <option value="50">50</option>
                        </select>
                        </div>
                    </div>
                    
                    {/* Submit button spanning two columns */}
                    <div style={{ gridColumn: 'span 2', textAlign: 'start' }}>
                        <button type="submit" className="btn btn-primary mt-2">
                            Apply Filters
                        </button>
                    </div>

                </div>
                
            </form>

            {loading ? (
                <p>Loading...</p>
            ) : promotions.length === 0 ? (
                <p>No promotions found.</p>
            ) : (
                <>
                    <div className="list-group">
                        {promotions.map((promo) => (
                            <Link
                                key={promo.id}
                                to={`/manager/promotions/${promo.id}`}
                                className="transaction-card transaction-adjustment mb-3" style={{textDecoration: 'none', color: 'inherit'}}
                                >
                                <div className="d-flex w-100 justify-content-between">
                                    <h5 className="mb-1">{promo.name}</h5>
                                    <small>{new Date(promo.startTime).toLocaleDateString()}</small>
                                </div>
                                <p className="mb-1">{promo.description}</p>
                                <small>
                                    Type: {promo.type} | Ends: {new Date(promo.endTime).toLocaleDateString()}
                                </small>
                            </Link>
                        ))}
                    </div>
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
