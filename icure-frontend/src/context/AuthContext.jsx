import { createContext, useState, useEffect, useContext } from 'react';
import api from '../utils/api';
import * as authUtils from '../utils/auth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(authUtils.getUser());
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const token = authUtils.getToken();
            if (token) {
                try {
                    const response = await api.get('/auth/me');
                    setUser(response.data);
                    authUtils.setUser(response.data);
                } catch (error) {
                    console.error('Initial auth check failed:', error);
                    authUtils.logout();
                    setUser(null);
                }
            }
            setLoading(false);
        };
        checkAuth();
    }, []);

    const login = async (username, password, isAdmin = false) => {
        const url = isAdmin ? '/auth/admin/login' : '/auth/login';
        const response = await api.post(url, { username, password });
        const { token, user: userData } = response.data;

        authUtils.setToken(token);
        authUtils.setUser(userData);
        setUser(userData);
        return userData;
    };

    const signup = async (data) => {
        const response = await api.post('/auth/signup', data);
        const { token, user: userData } = response.data;

        authUtils.setToken(token);
        authUtils.setUser(userData);
        setUser(userData);
        return userData;
    };

    const logout = () => {
        authUtils.logout();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, signup, logout, isDoctor: authUtils.isDoctor() }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
