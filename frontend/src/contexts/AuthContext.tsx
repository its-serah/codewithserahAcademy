import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { getMe } from "../api/endpoints";

interface User {
  id: number;
  email: string;
  name: string;
  username: string | null;
  certificate_name: string | null;
  role: string;
  is_active: boolean;
  is_verified: boolean;
  avatar_emoji: string | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  setToken: (token: string) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  setToken: () => {},
  logout: () => {},
  refreshUser: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await getMe();
      setUser(res.data);
    } catch {
      localStorage.removeItem("token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const setToken = (token: string) => {
    localStorage.setItem("token", token);
    setLoading(true);
    fetchUser();
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  const refreshUser = async () => {
    await fetchUser();
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, setToken, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
