"use client"
import { useState, useEffect, useCallback } from 'react';
import { is_Authenticated, getSession, loginWithLichess, logout as logoutUser } from '../auth/client';
import { LichessSession } from '../types';

/**
 * Hook for authentication state and actions
 */
export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [session, setSession] = useState<LichessSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Fetches authentication state
   */
  const checkAuthentication = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fixed function name to match what's in client.ts
      const authenticated = await is_Authenticated();
      setIsAuthenticated(authenticated);
      
      if (authenticated) {
        const sessionData = await getSession();
        setSession(sessionData);
      } else {
        setSession(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      setIsAuthenticated(false);
      setSession(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuthentication();
  }, [checkAuthentication]);

  /**
   * Redirects to Lichess login page
   */
  const login = useCallback(() => {
    loginWithLichess();
  }, []);

  /**
   * Logs out the current user
   */
  const logout = useCallback(async () => {
    try {
      await logoutUser();
      // Refresh auth state after logout
      await checkAuthentication();
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    }
  }, [checkAuthentication]);

  return {
    isAuthenticated,
    session,
    loading,
    error,
    login,
    logout,
    refresh: checkAuthentication
  };
}