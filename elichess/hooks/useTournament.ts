//@ts-ignore
import { useState, useEffect, useCallback } from 'react';
import { 
  fetchTournaments, 
  createTournament, 
  joinTournament,
  withdrawFromTournament,
  fetchMyTournaments,
  CreateTournamentOptions
} from '../api/tournaments';
import { useAuth } from './useAuth';

/**
 * Hook for fetching tournaments
 */
export function useTournaments() {
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTournamentList = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const tournamentsData = await fetchTournaments();
      setTournaments(tournamentsData || []);
      
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTournamentList();
  }, [fetchTournamentList]);

  return {
    tournaments,
    loading,
    error,
    refresh: fetchTournamentList
  };
}

/**
 * Hook for fetching tournaments the current user is participating in
 */
export function useMyTournaments() {
  const { isAuthenticated } = useAuth();
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchMyTournamentList = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const tournamentsData = await fetchMyTournaments();
      setTournaments(tournamentsData || []);
      
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchMyTournamentList();
    }
  }, [isAuthenticated, fetchMyTournamentList]);

  return {
    tournaments,
    loading,
    error,
    refresh: fetchMyTournamentList
  };
}

/**
 * Hook for creating and managing tournaments
 */
export function useTournamentActions() {
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [result, setResult] = useState<any | null>(null);

  /**
   * Create a tournament
   */
  const create = useCallback(async (options: CreateTournamentOptions) => {
    if (!isAuthenticated) {
      throw new Error('Authentication required');
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const tournamentData = await createTournament(options);
      setResult(tournamentData);
      return tournamentData;
      
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  /**
   * Join a tournament
   */
  const join = useCallback(async (tournamentId: string, password?: string) => {
    if (!isAuthenticated) {
      throw new Error('Authentication required');
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const success = await joinTournament(tournamentId, password);
      return success;
      
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      return false;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  /**
   * Withdraw from a tournament
   */
  const withdraw = useCallback(async (tournamentId: string) => {
    if (!isAuthenticated) {
      throw new Error('Authentication required');
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const success = await withdrawFromTournament(tournamentId);
      return success;
      
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      return false;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  return {
    result,
    loading,
    error,
    createTournament: create,
    joinTournament: join,
    withdrawFromTournament: withdraw
  };
}