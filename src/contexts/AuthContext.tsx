import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import api from '../services/api';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

type User = {
  id: any;
  utorid: string;
  name: string;
  email: string;
  role: string;
  points: number;
  verified: boolean;
  birthday?: string;
  avatarUrl?: string;
};

type AuthContextType = {
  user: User | null;
  login: (utorid: string, password: string) => Promise<{ success: boolean; user?: User }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

type AuthProviderProps = {
  children: ReactNode;
};

const normalizeUser = (data: any): User => {
  return {
    ...data,
    avatarUrl: data.avatarUrl ? `${BASE_URL}${data.avatarUrl}` : undefined,
  };
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
      const userData: User = normalizeUser(userResponse.data);
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

  const refreshUser = async () => {
    try {
      const userResponse = await api.get('/users/me');
      const userData: User = normalizeUser(userResponse.data);
      setUser(userData);
    } catch (error) {
      console.error('Failed to refresh user', error);
    }
  };

  useEffect(() => {
    const checkLoggedIn = async () => {
      setIsLoading(true);
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          const userResponse = await api.get('/users/me');
          const userData: User = normalizeUser(userResponse.data);
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
    <AuthContext.Provider value={{ user, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};