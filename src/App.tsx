
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import LoginPage from "./pages/LoginPage";
import NavBar from "./components/NavBar";
// import "./App.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import ProtectedRoute from "./components/protectedRoutes";
import ManagerCreateNewEvent from "./pages/manager/CreateEventPage";
import ForbiddenPage from "./pages/Forbidden";
import AllTransactionsPage from "./pages/manager/AllTransactionsPage/AllTransactionsPage";
import TransactionDetailPage from './pages/manager/TransactionDetailPage/TransactionDetailPage';


const AppRoutes = () => {
	const { user } = useAuth();
	return (
		<Routes>
			<Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/" />} />
			<Route path="/manager/events/new" element=
				{<ProtectedRoute requiredRole="manager">
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
