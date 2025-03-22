//@ts-ignore
import { useState, useEffect, useCallback } from 'react';
import { 
  getDailyPuzzle, 
  getNextPuzzle, 
  getPuzzleById,
  getPuzzleActivity,
  getPuzzleDashboard
} from '../api/puzzles';
import { useAuth } from './useAuth';

/**
 * Hook for fetching and working with puzzles
 */
export function usePuzzle(puzzleId?: string) {
  const { isAuthenticated } = useAuth();
  const [puzzle, setPuzzle] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Fetch a puzzle (daily, by ID, or next recommended)
   */
  const fetchPuzzle = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      let puzzleData;
      
      if (puzzleId) {
        // Fetch specific puzzle by ID
        puzzleData = await getPuzzleById(puzzleId);
      } else if (isAuthenticated) {
        // If authenticated, get a recommended puzzle
        puzzleData = await getNextPuzzle();
      } else {
        // Otherwise get the daily puzzle
        puzzleData = await getDailyPuzzle();
      }
      
      setPuzzle(puzzleData);
      
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [puzzleId, isAuthenticated]);

  useEffect(() => {
    fetchPuzzle();
  }, [fetchPuzzle]);

  /**
   * Get a new recommended puzzle
   */
  const getRecommendedPuzzle = useCallback(async () => {
    if (!isAuthenticated) {
      throw new Error('Authentication required for recommended puzzles');
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const puzzleData = await getNextPuzzle({ noCache: true });
      setPuzzle(puzzleData);
      
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  return {
    puzzle,
    loading,
    error,
    refresh: fetchPuzzle,
    getRecommendedPuzzle
  };
}

/**
 * Hook for fetching puzzle activity
 * 
 * @param max - Maximum number of activities to fetch
 */
export function usePuzzleActivity(max: number = 100) {
  const { isAuthenticated } = useAuth();
  const [activity, setActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchActivity = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const activityData = await getPuzzleActivity(max);
      setActivity(activityData || []);
      
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, max]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchActivity();
    }
  }, [isAuthenticated, fetchActivity]);

  return {
    activity,
    loading,
    error,
    refresh: fetchActivity
  };
}

/**
 * Hook for fetching puzzle dashboard data
 * 
 * @param days - Number of days to include (default: 30)
 */
export function usePuzzleDashboard(days: number = 30) {
  const { isAuthenticated } = useAuth();
  const [dashboard, setDashboard] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchDashboard = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const dashboardData = await getPuzzleDashboard(days);
      setDashboard(dashboardData);
      
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, days]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboard();
    }
  }, [isAuthenticated, fetchDashboard]);

  return {
    dashboard,
    loading,
    error,
    refresh: fetchDashboard
  };
}