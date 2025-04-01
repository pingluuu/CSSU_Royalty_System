import { createContext, useContext, useState, useEffect} from 'react';
import api from '../services/api'

const AuthContext = createContext()

export const AuthProvider = ({children}) => {
    const [user, setUser] = useState(null); //holds user info
    const login = async (utorid, password) => {  
        try {
            const tokenResponse= await api.post('/auth/tokens', { utorid, password });
            const token = tokenResponse.data.token;
            localStorage.setItem('authToken', token); //stores token locally
            const userResponse = await api.get('/users/me'); //gets user info
            const userData = userResponse.data
            setUser(userData)
            
            return { success: true, user: userData };
        }
        catch (error){
            console.log("Login failed", error)
            return {success: false}
        }
    }

    const logout = () => {
        setUser(null)
        localStorage.removeItem('authToken')
    }

    useEffect(() => { //need it for persistence otherwise it logs out after refresh page
        const checkLoggedIn = async () => {
            const token = localStorage.getItem('authToken')
            if (token){
                try {
                    const userResponse = await api.get('/users/me');
                    const userData = userResponse.data;
                    setUser(userData)
                }
                catch (error) {
                    logout()
                }
            }
        }
        checkLoggedIn()
    }, [])

    return (
        <AuthContext.Provider value={{ user, login, logout}}>
            {children}
        </AuthContext.Provider>
    )

}


export const useAuth = () => {
    return useContext(AuthContext)
}