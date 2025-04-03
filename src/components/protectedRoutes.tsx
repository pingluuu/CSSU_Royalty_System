import {useAuth} from "../contexts/AuthContext"
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredRole: string;
}
const ProtectedRoute = ({children, requiredRole}: ProtectedRouteProps) => {
    const {user} = useAuth();
    const roles = requiredRole.split(" ")
    
    console.log(requiredRole)
    console.log("arr", roles)
    if (!user){
        return <Navigate to="/login"/>
    }
    
    if (!roles.includes(user.role)){ //if not enough clearance, redirect to forbidden page
        return <Navigate to="/forbidden"/>
    }
    

    return <>{children}</>

}

export default ProtectedRoute
