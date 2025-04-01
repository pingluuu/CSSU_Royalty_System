import {useAuth} from "../contexts/AuthContext"
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredRole: string;
}
const ProtectedRoute = ({children, requiredRole}: ProtectedRouteProps) => {
    const {user} = useAuth();
    
    if (!user){
        return <Navigate to="/login"/>
    }
    
    if (requiredRole != user.role){ //if not enough clearance, redirect to forbidden page
        return <Navigate to="/forbidden"/>
    }
    

    return <>{children}</>

}

export default ProtectedRoute
