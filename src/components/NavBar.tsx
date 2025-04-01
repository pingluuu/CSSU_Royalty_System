
import {Link} from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'


export default function NavBar() {

    const {user, logout} = useAuth();
    const handleLogout = () => {
        logout();
    }

    return (
        <nav className="navbar navbar-light bg-light">
            <div className="container-fluid">
                <Link className="navbar-brand" to="/">
                    LoyaltyApp
                </Link>
                <div className="d-flex align-items-center"> 
                    {user ? (
                        <>
                            <span className="navbar-text me-3"> 
                                Welcome, {user.utorid}!
                            </span>
                            <button
                                className="btn btn-primary"
                                type="button"
                                onClick={handleLogout}
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        
                        <Link className="btn btn-primary" to="/login"> 
                            Login
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    )


}