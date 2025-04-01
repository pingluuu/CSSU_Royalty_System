import { useEffect, useState } from "react";
import api from "../../services/api";

type Promotion = {
  id: number;
  name: string;
  type: "automatic" | "one-time";
  endTime: string;
  minSpending?: number;
  rate?: number;
  points?: number;
};

const PromotionsList = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const pageSize = 5;

  useEffect(() => {
    const fetchPromotions = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/promotions?page=${page}&limit=${pageSize}`);
        setPromotions(res.data.results);
        setTotalPages(Math.ceil(res.data.count / pageSize));
      } catch (err) {
        console.error("Error fetching promotions", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPromotions();
  }, [page]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Your Available Promotions</h1>

      {loading ? (
        <p>Loading...</p>
      ) : promotions.length === 0 ? (
        <p>No promotions available.</p>
      ) : (
        <div className="space-y-4">
          {promotions.map((promo) => (
            <div
              key={promo.id}
              className="border border-gray-300 rounded-lg shadow p-4"
            >
              <h2 className="text-xl font-semibold">{promo.name}</h2>
              <p className="text-gray-700">Type: {promo.type}</p>
              <p className="text-gray-600">
                Ends: {new Date(promo.endTime).toLocaleDateString()}
              </p>
              {promo.minSpending && (
                <p className="text-sm text-gray-500">
                  Min. Spending: ${promo.minSpending}
                </p>
              )}
              {promo.rate !== undefined && (
                <p className="text-sm text-gray-500">
                  Bonus Rate: {promo.rate * 100}%
                </p>
              )}
              {promo.points !== undefined && (
                <p className="text-sm text-gray-500">
                  Bonus Points: {promo.points}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="mt-6 flex justify-center space-x-4">
        {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
        <button
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
          disabled={page === 1}
          className="bg-gray-300 px-4 py-2 rounded disabled:opacity-50"
        >
          Previous
        </button>
        <span className="px-4 py-2 text-gray-700">
          Page {page} of {totalPages}
        </span>
        {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
        <button
          onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
          disabled={page === totalPages}
          className="bg-gray-300 px-4 py-2 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default PromotionsList;
