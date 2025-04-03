
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import LoginPage from "./pages/LoginPage";
import NavBar from "./components/NavBar";
// import "./App.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import ProtectedRoute from "./components/protectedRoutes";
import ManagerCreateNewEvent from "./pages/manager/CreateEventPage/CreateEventPage";
import ForbiddenPage from "./pages/Forbidden";
import AllTransactionsPage from "./pages/manager/AllTransactionsPage/AllTransactionsPage";
import TransactionDetailPage from './pages/manager/TransactionDetailPage/TransactionDetailPage';
import CreatePromotionPage from './pages/manager/CreatePromotionPage/CreatePromotionPage';
import PromotionsListingPage from './pages/manager/PromotionsListingPage/PromotionsListingPage';
import PromotionDetailPage from './pages/manager/PromotionDetailPage/PromotionDetailPage';
import PromotionsListingRegular from './pages/regular/PromotionsListingRegular/PromotionsListingRegular';
import PublishedEventsPageRegular from './pages/regular/PublishedEventsPageRegular/PublishedEventsPageRegular';
import EventDetailPageRegular from './pages/regular/EventDetailPageRegular/EventDetailPageRegular';

const AppRoutes = () => {
	const { user } = useAuth();
	return (
		<Routes>
			<Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/" />} />
			<Route
				path="/events"
				element={
					<ProtectedRoute requiredRole="regular">
						<PublishedEventsPageRegular />
					</ProtectedRoute>
				}
			/>

			<Route
				path="/events/:id"
				element={
					<ProtectedRoute requiredRole="regular">
						<EventDetailPageRegular />
					</ProtectedRoute>
				}
			/>
			<Route
				path="/promotions"
				element={
					<ProtectedRoute requiredRole="regular">
						<PromotionsListingRegular />
					</ProtectedRoute>
				}
			/>
			<Route path="/create-event" element=
				{<ProtectedRoute requiredRole="manager superuser">
					<ManagerCreateNewEvent />
				</ProtectedRoute>} />

			<Route path="/all-transactions" element={
				<ProtectedRoute requiredRole="manager">
					<AllTransactionsPage />
				</ProtectedRoute>} />

			<Route
				path="/transactions/:id"
				element={
					<ProtectedRoute requiredRole="manager">
						<TransactionDetailPage />
					</ProtectedRoute>
				}
			/>
			<Route
				path="/create-promotion"
				element={
					<ProtectedRoute requiredRole="manager">
						<CreatePromotionPage />
					</ProtectedRoute>
				}
			/>
			<Route path="/promotions-manager" element={
				<ProtectedRoute requiredRole="manager">
					<PromotionsListingPage />
				</ProtectedRoute>
			}
			/>
			<Route path="/manager/promotions/:id" element={
				<ProtectedRoute requiredRole="manager">
					<PromotionDetailPage />
				</ProtectedRoute>
			} />

			<Route path="/" element={<div>THIS IS JUST PLACEHOLDER PAGE</div>} />
			<Route path="/forbidden" element={<ForbiddenPage />} />
			<Route path="*" element={<div>404 - Page Not Found</div>} />
		</Routes>
	)
}
function App() {
	return (
		<BrowserRouter>
			<AuthProvider>
				<NavBar />
				<AppRoutes />
			</AuthProvider>
		</BrowserRouter>
	);
}

export default App;
