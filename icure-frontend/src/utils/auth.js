export const setToken = (token) => localStorage.setItem('token', token);
export const getToken = () => localStorage.getItem('token');
export const removeToken = () => localStorage.removeItem('token');

export const setUser = (user) => localStorage.setItem('user', JSON.stringify(user));
export const getUser = () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
};
export const removeUser = () => localStorage.removeItem('user');

export const logout = () => {
    removeToken();
    removeUser();
};

export const isAuthenticated = () => !!getToken();
export const isDoctor = () => {
    const user = getUser();
    return user && user.role === 'doctor';
};
