import PropTypes from 'prop-types';
import { createContext, useMemo, useState, useEffect } from 'react';
import { useLocalStorage } from 'hooks/useLocalStorage';
import { login as loginApi } from 'api/auth';

export const AuthContext = createContext(undefined);

function decodeToken(token) {
  if (!token) return null;
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window.atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

export function AuthProvider({ children }) {
  const { state: token, setState: setToken, resetState: resetToken } = useLocalStorage('token', null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (token) {
      const decoded = decodeToken(token);
      if (decoded) {
        const username = decoded['unique_name'] || decoded['name'] || decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || '';
        const role = decoded['role'] || decoded['http://schemas.xmlsoap.org/ws/2008/06/identity/claims/role'] || '';
        setUser({ username, role });
      } else {
        setUser(null);
      }
    } else {
      setUser(null);
    }
  }, [token]);

  const login = async (username, password) => {
    const data = await loginApi(username, password);
    if (data && data.token) {
      setToken(data.token);
      return data;
    } else {
      throw new Error('Authentication failed');
    }
  };

  const logout = () => {
    resetToken();
    setUser(null);
  };

  const isLoggedIn = Boolean(token && user);

  const memoizedValue = useMemo(
    () => ({
      token,
      user,
      isLoggedIn,
      login,
      logout
    }),
    [token, user, isLoggedIn]
  );

  return <AuthContext.Provider value={memoizedValue}>{children}</AuthContext.Provider>;
}

AuthProvider.propTypes = { children: PropTypes.node };
