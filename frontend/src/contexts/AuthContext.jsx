import React, { createContext, useContext, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../hooks/redux.js';
import { setUser, clearAuth } from '../store/slices/authSlice.js';
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
  const { user, token, isAuthenticated, loading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    const initializeAuth = async () => {
      // Check if we have a token but no user
      if (token && !user) {
        try {
          // Try to get user profile from API
          const response = await authService.getProfile();
          const userData = response.data?.data || response.data;
          dispatch(setUser(userData));
        } catch (error) {
          console.error('Failed to get user profile:', error);
          // If API call fails, try to get user from localStorage
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            try {
              const parsedUser = JSON.parse(storedUser);
              dispatch(setUser(parsedUser));
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
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            dispatch(setUser(parsedUser));
          } catch (parseError) {
            console.error('Failed to parse stored user:', parseError);
            dispatch(clearAuth());
          }
        }
      }
    };

    initializeAuth();
  }, [token, user, dispatch]);

  const value = {
    user,
    token,
    isAuthenticated,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
