import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";


function LoginPage() {
    const [utorid, setUtorid] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth(); // Get the login function from context

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        
        const result = await login(utorid, password);
        console.log(result)
        if (!result.success) {
            setError(result.error || 'Login failed.');
        }
     
    };

    return (
        <div>
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="utorid">UTORid:</label>
                    <input type="text" id="utorid" value={utorid} onChange={(e) => setUtorid(e.target.value)} required />
                </div>
                <div>
                    <label htmlFor="password">Password:</label>
                    <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                
                <button type="submit">
                    LOGIN
                </button>
            </form>
        </div>
    );
}

export default LoginPage;