
import { BrowserRouter,Route, Routes, Navigate} from "react-router-dom";
import { AuthProvider , useAuth} from "./contexts/AuthContext";
import LoginPage from "./pages/LoginPage";
import NavBar from "./components/NavBar";
// import "./App.css";
import 'bootstrap/dist/css/bootstrap.min.css';


const AppRoutes = () => {
	const {user} = useAuth();
	return (
		<Routes>
			<Route path="/login" element={!user? <LoginPage/>: <Navigate to="/"/>}/>
			<Route path = "/" element={<div>THIS IS JUST PLACEHOLDER PAGE</div>}/>
			<Route path="*" element={<div>404 - Page Not Found</div>} />
		</Routes>
	)
}
function App() {
	return (
    <BrowserRouter>
      	<AuthProvider>
			<NavBar/>
        	<AppRoutes/>
      	</AuthProvider>
    </BrowserRouter>
  );
}

export default App;
