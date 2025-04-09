
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import LoginPage from "./pages/LoginPage";
import NavBar from "./components/NavBar/NavBar";
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
import PromotionsListingRegular from './components/PromotionsListingRegular/PromotionsListingRegular';
import PublishedEventsPageRegular from './pages/regular/PublishedEventsPageRegular/PublishedEventsPageRegular';
import EventDetailPageRegular from './pages/regular/EventDetailPageRegular/EventDetailPageRegular'
import EventDetailPageManager from "./pages/manager/EventDetailPage/EventDetailPageManager";
import UserQRCodePage from "./pages/regular/UserQRCodePage/UserQRCodePage";
import UnprocessedRedemptionQRPage from "./pages/regular/UnprocessedRedemptionQRPage/UnprocessedRedemptionQRPage";
import ProcessRedemptionPage from "./pages/cashier/ProcessRedemptionPage/ProcessRedemptionPage";
import ManageEventOrganizer from "./pages/manager/ManageEventOrganizerPage/ManageEventOrganizer";
import ManageEventGuestPage from "./pages/manager/ManageEventGuestPage/ManageEventGuestPage";
import AwardPointsPage from "./pages/manager/Award Points/AwardPointsPage";
import LandingPage from './components/LandingPage';
import ProfilePage from './components/ProfilePage';
import CreateTransaction from "./pages/cashier/CashierCreateTransaction/CashierCreateTransaction";
import ManagerCreateTransaction from "./pages/manager/ManagerCreateTransaction/ManagerCreateTransaction";
import MyTransactions from "./components/MyTransactionsPage";
import PromoteUserPage from './components/PromoteUserPage';
import EventsListingPage from "./components/EventsListingPage";
import CreateAccount from "./components/CreateAccount";
import UsersListing from "./components/UsersListing";
import RegisterPage from "./pages/RegisterPage";
import TransferPage from "./components/TransferPage";
import UserDetail from "./components/UserDetail";
import UserRetrieval from "./pages/cashier/UserRetrieval";
import MyEvents from "./components/MyEventsPage";
import MyEventsPage from "./components/MyEventsPage";


const AppRoutes = () => {
	const { user } = useAuth();
	return (
		<Routes>
			<Route path="/" element={<LandingPage />} />

			<Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/" />} />
			<Route path="/register" element={<RegisterPage />} />


			<Route
				path="/profile"
				element={
					<ProtectedRoute requiredRole="manager superuser cashier regular"> {/* or just make it available to all roles */}
						<ProfilePage />
					</ProtectedRoute>
				}
			/>

			<Route path="/my-qr" element={
				<ProtectedRoute requiredRole="regular">
					<UserQRCodePage />
				</ProtectedRoute>
			} />
			<Route path="/users" element={
				<ProtectedRoute requiredRole="manager superuser">
					<UsersListing />
				</ProtectedRoute>
			} />
			<Route path="/retrieve-user" element={
				<ProtectedRoute requiredRole="cashier">
					<UserRetrieval />
				</ProtectedRoute>
			} />

			<Route path="/users/:userId" element={
				<ProtectedRoute requiredRole="cashier manager superuser regular">
					<UserDetail />
				</ProtectedRoute>
			} />
			<Route 
			 path="/transfer"
			 element={
				 <ProtectedRoute requiredRole="regular manager superuser cashier">
					 <TransferPage />
				 </ProtectedRoute>
			 }
			/>
			<Route
				path="/redeem"
				element={
					<ProtectedRoute requiredRole="regular">
						<UnprocessedRedemptionQRPage />
					</ProtectedRoute>
				}
			/>
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
					<PromotionsListingRegular />
				}
			/>

			<Route
				path="/process-redemption"
				element={
					<ProtectedRoute requiredRole="cashier">
						<ProcessRedemptionPage />
					</ProtectedRoute>
				}
			/>
			<Route path="/create-account" element=
				{<ProtectedRoute requiredRole="manager superuser cashier">
					<CreateAccount />
				</ProtectedRoute>}
			/>
			<Route path="/create-event" element=
				{<ProtectedRoute requiredRole="manager superuser">
					<ManagerCreateNewEvent />
				</ProtectedRoute>} /> 


			<Route path="/all-events" element=
				{<ProtectedRoute requiredRole="manager regular">
					<EventsListingPage/>
				</ProtectedRoute>}
			/>

			<Route path="/my-events" element=
				{<ProtectedRoute requiredRole="manager regular">
					<MyEventsPage/>
				</ProtectedRoute>}
			/>

			<Route path="manager/events/:id/manage-guests" element=
				{<ProtectedRoute requiredRole="manager superuser cashier regular">
					<ManageEventGuestPage />
				</ProtectedRoute>}
			/>

			<Route
				path="/manager/events/:id/manage-organizers"
				element={
					<ProtectedRoute requiredRole="manager superuser">
						<ManageEventOrganizer />
					</ProtectedRoute>
				}
			/>
			<Route path="/manager/events/:id/award-points" element=
				{<ProtectedRoute requiredRole="manager superuser cashier regular">
					<AwardPointsPage />
				</ProtectedRoute>}
			/>

            
			<Route path="/manager/events/:id" element=
				{<ProtectedRoute requiredRole="manager superuser regular cashier">
					<EventDetailPageManager />
				</ProtectedRoute>}
			/>
			

			<Route path="/create-transaction-cashier" element=
				{<ProtectedRoute requiredRole="cashier">
					<CreateTransaction />
				</ProtectedRoute>}
			/>

			<Route path="/create-transaction-manager" element=
				{<ProtectedRoute requiredRole="manager">
					<ManagerCreateTransaction />
				</ProtectedRoute>}
			/>


			<Route path="/all-transactions" element={
				<ProtectedRoute requiredRole="manager">
					<AllTransactionsPage />
				</ProtectedRoute>} />

			<Route path="/my-transactions" element=
				{<ProtectedRoute requiredRole="manager superuser regular cashier">
					<MyTransactions />
				</ProtectedRoute>}
			/>

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
				<ProtectedRoute requiredRole="manager superuser">
					<PromotionsListingPage />
				</ProtectedRoute>
			}
			/>
			<Route path="/manager/promotions/:id" element={
				<ProtectedRoute requiredRole="manager">
					<PromotionDetailPage />
				</ProtectedRoute>
			} />

			<Route
				path="/promote"
				element={
					<ProtectedRoute requiredRole="superuser manager">
						<PromoteUserPage />
					</ProtectedRoute>
				}
			/>

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
