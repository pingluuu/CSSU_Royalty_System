import api from "../services/api";
// import { useAuth } from "../contexts/AuthContext";
import { useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
// This component is for all logged in users to view their transactions
import { useAuth } from "../contexts/AuthContext";


const typeColors: Record<string, string> = {
    purchase: 'transaction-purchase',
    adjustment: 'transaction-adjustment',
    transfer: 'transaction-transfer',
    redemption: 'transaction-redemption',
    event: 'transaction-event',
};



export default function MyTransactions() {
    const { user } = useAuth()
    const [searchParams, setSearchParams] = useSearchParams();
    const initPage = parseInt(searchParams.get("page") || "1", 10);
    const initType = searchParams.get("type") || "";
    const initRelatedId = searchParams.get("relatedId") || "";
    const initPromotionId = searchParams.get("promotionId") || "";
    const initAmount = searchParams.get("amount") || "";
    const initOperator = searchParams.get("operator") || "";
    const initLimit = parseInt(searchParams.get("limit") || "10", 10);

    interface Transaction {
        id: number;
        type: string;
        utorid: string;
        spent?: number;
        amount?: number;
        relatedId?: number;
        remark?: string;
        suspicious: boolean;
        createdBy: string;
        promotionIds?: string[];
    }

    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [page, setPage] = useState<number>(initPage);
    const [totalCount, setTotalCount] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [limit, setLimit] = useState(initLimit);

    const [type, setType] = useState<string>(initType);
    const [relatedId, setRelatedId] = useState<string>(initRelatedId);
    const [promotionId, setPromotionId] = useState<string>(initPromotionId);
    const [amount, setAmount] = useState<string>(initAmount);
    const [operator, setOperator] = useState<string>(initOperator);
    const [fetchTrigger, setFetchTrigger] = useState(0)



    const totalPages = Math.max(Math.ceil(totalCount / limit), 1)
    const applyFilters = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        event.preventDefault();

        if (page !== 1) {
            setPage(1);
        } else {

            setFetchTrigger((prev) => prev + 1);
        }

    }
    useEffect(() => {
        const fetchTransactions = async () => {
            const payload: any = { page, limit };

            if (type.trim()) {
                payload.type = type.toLowerCase()

                if (relatedId.trim()) {
                    payload.relatedId = parseInt(relatedId, 10);
                }
            }
            if (promotionId.trim()) {
                payload.promotionId = parseInt(promotionId, 10);
            }

            if (amount.trim() && operator.trim()) {
                payload.amount = parseFloat(amount);
                console.log(operator)
                payload.operator = operator;
            }

            try {
                const res = await api.get('/users/me/transactions', { params: payload })
                console.log(res.data)
                setTotalCount(res.data.count)
                setTransactions(res.data.results)

            }

            catch (err) {
                console.log("error", err)
                setError("Failed to fetch transactions");
            }
            finally {
                setLoading(false)
            }

        }
        updateURL()
        fetchTransactions()

    }, [page, fetchTrigger])

    const transactionNavLink = (tr: Transaction): string => {
        const hasPermission = user && ["manager"].includes(user.role);
        return hasPermission ? `/transactions/${tr.id}` : "#";
    }


    const updateURL = () => {
        const newParams: any = { page: page.toString(), limit: limit.toString()};
        if (type) newParams.type = type;
        if (relatedId) newParams.relatedId = relatedId;
        if (promotionId) newParams.promotionId = promotionId;
        if (amount) newParams.amount = amount;
        if (operator) newParams.operator = operator;
        setSearchParams(newParams);
    };

    return (
        <div className="container mt-4">
            <h2>My Transactions</h2>
            <form className="mb-4">
                <div className="row">
                    <div className="col-md-4 ">
                        <label>Type:</label>
                        <select
                            id="transaction-type"
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            className="form-control"
                        >
                            <option value="">All</option>
                            <option value="purchase">Purchase</option>
                            <option value="adjustment">Adjustment</option>
                            <option value="redemption">Redemption</option>
                            <option value="transfer">Transfer</option>
                            <option value="event">Event</option>
                        </select>
                    </div>
                    <div className="col-md-4">
                        <label className="form-label">Related ID:</label>
                        <input
                            id="related-id"
                            type="number"
                            value={relatedId}
                            onChange={(e) => setRelatedId(e.target.value)}
                            className="form-control"
                            placeholder="Enter Related ID"
                        />
                    </div>
                    <div className="col-md-4">
                        <label className="form-label">Promotion ID:</label>
                        <input
                            id="promotion-id"
                            type="number"
                            value={promotionId}
                            onChange={(e) => setPromotionId(e.target.value)}
                            className="form-control"
                            placeholder="Enter Promotion ID"
                        />
                    </div>
                    <div className="col-md-4">
                        <label className="form-label">Amount:</label>
                        <input
                            id="amount"
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="form-control"
                            placeholder="Enter Amount"
                        />
                    </div>
                    <div className="col-md-4">
                        <label className="form-label">Operator:</label>
                        <select
                            id="operator"
                            value={operator}
                            onChange={(e) => setOperator(e.target.value)}
                            className="form-control"
                        >
                            <option value="">Select</option>
                            <option value="gte">Greater than or equal</option>
                            <option value="lte">Less than or equal</option>
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
                    <div className="col-md-4 d-flex align-items-end">
                        <button type="submit" onClick={applyFilters} className="btn btn-primary w-100 mt-2">
                            Apply Filters
                        </button>
                    </div>
                </div>
            </form>
            <div>
                {loading ? (
                    <p className="text-center">Loading...</p>
                ) : error ? (
                    <div className="alert alert-danger" role="alert">{error}</div>
                ) : transactions.length === 0 ? (
                    <p className="text-center">No transactions found.</p>
                ) : (
                    <>
                        {transactions.map((tx) => {
                            return (
                                <Link
                                    to={transactionNavLink(tx) ?? "#"}
                                    key={tx.id}
                                    className={`transaction-card ${typeColors[tx.type] || ''} ${tx.suspicious ? 'transaction-suspicious' : ''
                                        }`}
                                    style={{ textDecoration: 'none', color: 'inherit', cursor: 'auto'}}
                                >
                                    <h5>Transaction #{tx.id}</h5>
                                    <p>
                                        <strong>Type:</strong> {tx.type}
                                        <br />
                                        {/* Since this is my own transactions, it shows what transactions involved in */}
                                        <strong>User:</strong> {user?.utorid}
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
                                        {(tx.promotionIds ?? []).length > 0 ? (
                                            <>
                                                <strong>Promotions:</strong> {(tx.promotionIds ?? []).join(', ')}
                                                <br />
                                            </>
                                        ) :
                                            <>
                                                <strong>Promotions:</strong> No Promotions Applied
                                                <br />
                                            </>
                                        }
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
                            )
                        })}

                        {totalPages > 1 && (
                            <div className="pagination-controls">
                                <button
                                    type="button"
                                    className="btn btn-outline-primary"
                                    onClick={() => setPage((p) => Math.max(p - 1, 1))}
                                    disabled={page <= 1 || loading}
                                >
                                    Previous
                                </button>
                                <span className="align-self-center">Page {page} of {totalPages}</span>
                                <button
                                    type="button"
                                    className="btn btn-outline-primary"
                                    onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                                    disabled={page >= totalPages || loading}
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

        </div>
    )
}