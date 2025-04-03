import { useEffect, useState } from 'react';
import api from '../../../services/api';
import { useAuth } from '../../../contexts/AuthContext';
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
  const { user } = useAuth();
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [nameFilter, setNameFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const limit = 10;

  const fetchPromotions = async () => {
    setLoading(true);
    try {
      const params: any = {
        page,
        limit,
      };
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

  useEffect(() => {
    if (user?.role === 'regular') {
      fetchPromotions();
    }
  }, [page, nameFilter, typeFilter]);

  const totalPages = Math.ceil(count / limit);

  return (
    <div className="container mt-4">
      <h2>Available Promotions</h2>

      <form
        className="row g-3 mb-3"
        onSubmit={(e) => {
          e.preventDefault();
          fetchPromotions();
        }}
      >
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
        <div className="col-md-4 d-flex align-items-end">
          <button type="submit" className="btn btn-primary w-100">
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
              <div key={promo.id} className="list-group-item">
                <h5>{promo.name}</h5>
                <p>
                  <strong>Type:</strong> {promo.type}<br />
                  <strong>Ends:</strong> {new Date(promo.endTime).toLocaleString()}<br />
                  {promo.minSpending !== undefined && (
                    <span><strong>Min Spending:</strong> ${promo.minSpending}<br /></span>
                  )}
                  {promo.rate !== undefined && (
                    <span><strong>Rate:</strong> {promo.rate} points per $<br /></span>
                  )}
                  {promo.points !== undefined && (
                    <span><strong>Fixed Points:</strong> {promo.points}</span>
                  )}
                </p>
              </div>
            ))}
          </div>

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
