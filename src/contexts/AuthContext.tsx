import {
  createContext,
  useContext,
  useState,
  useEffect,
} from 'react';
import type { ReactNode } from 'react';
import api from '../services/api';

type User = {
  name: any;
  email: any;
  id: any;
  utorid: string;
  role: string;
  // Add other user fields if needed
};

type AuthContextType = {
  user: User | null;
  login: (utorid: string, password: string) => Promise<{ success: boolean; user?: User }>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const login = async (utorid: string, password: string) => {
    try {
      const tokenResponse = await api.post('/auth/tokens', { utorid, password });
      const token = tokenResponse.data.token;
      localStorage.setItem('authToken', token);

      const userResponse = await api.get('/users/me');
      const userData: User = userResponse.data;
      setUser(userData);

      return { success: true, user: userData };
    } catch (error) {
      console.log('Login failed', error);
      return { success: false };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('authToken');
  };

  useEffect(() => {
    const checkLoggedIn = async () => {
      setIsLoading(true);
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          const userResponse = await api.get('/users/me');
          const userData: User = userResponse.data;
          setUser(userData);
        } catch (error) {
          console.log(error);
          logout();
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    checkLoggedIn();
  }, []);

  if (isLoading) {
    return <div>APP CHECKING OR ELSE THERE IS RACE CON</div>;
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
