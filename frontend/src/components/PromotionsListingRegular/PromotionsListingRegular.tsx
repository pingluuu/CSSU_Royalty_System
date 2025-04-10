import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../services/api';

import './PromotionsListingRegular.css';

interface Promotion {
  id: number;
  name: string;
  type: string;
  endTime: string;
  minSpending?: number;
  rate?: number;
  points?: number;
}

export default function PromotionsListingPageRegular() {
  // Removed unused 'user' variable
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  

  // Use URL search parameters for bookmarking filter state and pagination
  const [searchParams, setSearchParams] = useSearchParams();

  // Initialize local filter state from URL parameters
  const [nameFilter, setNameFilter] = useState(searchParams.get('name') || '');
  const [typeFilter, setTypeFilter] = useState(searchParams.get('type') || '');
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
      const params: any = { page, limit };
      if (nameFilter) params.name = nameFilter;
      if (typeFilter) params.type = typeFilter;
      const res = await api.get('/promotions', { params });
      setPromotions(res.data.results);
      setCount(res.data.count);
    } catch (err) {
      console.error('Error fetching promotions:', err);
    } finally {
      setLoading(false);
    }
  };

  // When the URL search parameters change, update local state and fetch data
  useEffect(() => {
    setNameFilter(searchParams.get('name') || '');
    setTypeFilter(searchParams.get('type') || '');
    setPage(searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : 1);
    fetchPromotions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const totalPages = Math.ceil(count / limit);

  // On filter form submission, update URL query parameters (bookmarkable)
  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params: Record<string, string> = {};
    if (nameFilter) params.name = nameFilter;
    if (typeFilter) params.type = typeFilter;
    // Reset page to 1 upon filter submission
    params.page = '1';
    params.limit = limit.toString();
    setSearchParams(params);
  };

  // Update URL query parameters for pagination while preserving current filters
  const handlePageChange = (newPage: number) => {
    const currentParams = Object.fromEntries([...searchParams]);
    currentParams.page = newPage.toString();
    setSearchParams(currentParams);
  };


  return (
    <div className="container mt-4">
      <h2>Available Promotions</h2>

      {/* Filter form using a two-column grid layout */}
      <form className="mb-3" onSubmit={handleFilterSubmit}>
        <div className="row">
          <div className="col-md-4">
            <label className="form-label">Search by Name</label>
            <input
              type="text"
              className="form-control"
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
            />
          </div>
          <div className="col-md-4">
            <label className="form-label">Filter by Type</label>
            <select
              className="form-select"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="">All</option>
              <option value="automatic">Automatic</option>
              <option value="one_time">One-Time</option>
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
        </div>
        
        {/* Submit button spanning both columns */}
        <div style={{ gridColumn: 'span 2', textAlign: 'start' }}>
          <button type="submit" className="btn btn-primary w-100 mt-3">
            Apply Filters
          </button>
        </div>
      </form>

      {loading ? (
        <p>Loading...</p>
      ) : promotions.length === 0 ? (
        <p>No available promotions found.</p>
      ) : (
        <>
          <div className="list-group">
            {promotions.map((promo) => (
              <div key={promo.id} className="transaction-card transaction-adjustment mb-3">
                <h5>{promo.name}</h5>
                <p>
                  <strong>Type:</strong> {promo.type}
                  <br />
                  <strong>Ends:</strong>{' '}
                  {new Date(promo.endTime).toLocaleString()}
                  <br />
                  {promo.minSpending !== undefined && (
                    <span>
                      <strong>Min Spending:</strong> ${promo.minSpending}
                      <br />
                    </span>
                  )}
                  {promo.rate !== undefined && (
                    <span>
                      <strong>Rate:</strong> {promo.rate} points per $
                      <br />
                    </span>
                  )}
                  {promo.points !== undefined && (
                    <span>
                      <strong>Fixed Points:</strong> {promo.points}
                    </span>
                  )}
                </p>
              </div>
            ))}
          </div>

          <div className="d-flex justify-content-between align-items-center mt-4">
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
