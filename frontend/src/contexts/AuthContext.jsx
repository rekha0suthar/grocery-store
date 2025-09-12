import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAppSelector, useAppDispatch } from '../hooks/redux.js';
import { setCredentials, clearAuth } from '../store/slices/authSlice.js';
import { authService } from '../services/authService.js';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const dispatch = useAppDispatch();
  const { user, token, isAuthenticated } = useAppSelector((state) => state.auth);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      setAuthLoading(true);
      
      // Check if we have a token but no user
      if (token && !user) {
        try {
          // Try to get user profile from API
          const response = await authService.getProfile();
          const userData = response.data?.data || response.data;
          dispatch(setCredentials({ user: userData, token, refreshToken: localStorage.getItem('refreshToken') }));
        } catch (error) {
          console.error('Failed to get user profile:', error);
          // If API call fails, try to get user from localStorage
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            try {
              const parsedUser = JSON.parse(storedUser);
              dispatch(setCredentials({ user: parsedUser, token, refreshToken: localStorage.getItem('refreshToken') }));
            } catch (parseError) {
              console.error('Failed to parse stored user:', parseError);
              dispatch(clearAuth());
            }
          } else {
            dispatch(clearAuth());
          }
        }
      } else if (!token && !user) {
        // No token and no user, check localStorage for user data
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('token');
        const storedRefreshToken = localStorage.getItem('refreshToken');
        
        if (storedUser && storedToken) {
          try {
            const parsedUser = JSON.parse(storedUser);
            dispatch(setCredentials({ user: parsedUser, token: storedToken, refreshToken: storedRefreshToken }));
          } catch (parseError) {
            console.error('Failed to parse stored user:', parseError);
            dispatch(clearAuth());
          }
        }
      }
      
      setAuthLoading(false);
    };

    initializeAuth();
  }, [token, user, dispatch]);

  const value = {
    user,
    token,
    isAuthenticated,
    loading: authLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
