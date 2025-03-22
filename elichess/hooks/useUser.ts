//@ts-ignore
import { useState, useEffect, useCallback } from 'react';
import { fetchUserProfile, fetchUserPreferences, fetchUserGames } from '../api/account';
import { LichessUser } from '../types';
import { useAuth } from './useAuth';

/**
 * Hook for accessing and managing user data
 */
export function useUser() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [user, setUser] = useState<LichessUser | null>(null);
  const [preferences, setPreferences] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Fetch user profile data
   */
  const fetchProfile = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const userData = await fetchUserProfile({ noCache: true });
      setUser(userData);
      
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  /**
   * Fetch user preferences
   */
  const fetchPrefs = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const prefsData = await fetchUserPreferences();
      setPreferences(prefsData);
      
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      fetchProfile();
    }
  }, [authLoading, isAuthenticated, fetchProfile]);

  return {
    user,
    preferences,
    loading: loading || authLoading,
    error,
    refresh: fetchProfile,
    fetchPreferences: fetchPrefs
  };
}

/**
 * Hook for fetching a user's games
 * 
 * @param username - Optional username (defaults to current user)
 * @param options - Game fetch options
 */
export function useUserGames(
  username?: string, 
  options = { max: 10, ongoing: true, finished: true, pgnInJson: true }
) {
  const { isAuthenticated } = useAuth();
  const [games, setGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchGames = useCallback(async () => {
    if (!isAuthenticated) {
      setGames([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const gamesData = await fetchUserGames(username, options);
      
      if (!gamesData) {
        setGames([]);
        throw new Error('Failed to fetch games');
      }
      
      // Handle different response formats
      if (Array.isArray(gamesData)) {
        // Regular array of games
        setGames(gamesData);
      } else if (gamesData.format === 'pgn') {
        // PGN format - for display purposes, create basic game objects
        const simplifiedGames = gamesData.games.map((pgn: { match: (arg0: RegExp) => string[]; }, index: any) => {
          // Extract basic info from PGN using regex
          const event = pgn.match(/\[Event "([^"]+)"/)?.[1] || 'Game';
          const white = pgn.match(/\[White "([^"]+)"/)?.[1] || 'Unknown';
          const black = pgn.match(/\[Black "([^"]+)"/)?.[1] || 'Unknown';
          const date = pgn.match(/\[Date "([^"]+)"/)?.[1] || 'Unknown date';
          
          return {
            id: `pgn-${index}`,
            white: { name: white },
            black: { name: black },
            createdAt: date,
            status: 'finished',
            pgn: pgn,
            event: event
          };
        });
        
        setGames(simplifiedGames);
      } else {
        // Unknown format
        setGames([]);
        throw new Error('Unsupported games data format');
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, username, options]);

  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

  return { games, loading, error, refresh: fetchGames };
}