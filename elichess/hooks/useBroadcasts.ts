//@ts-ignore
import { useState, useEffect, useCallback } from 'react';
import { 
  getOfficialBroadcasts,
  getTopBroadcasts,
  getUserBroadcasts,
  getBroadcastTournament,
  
  exportBroadcastRoundPgn,
  getMyBroadcastRounds,
  createBroadcastTournament,
  createBroadcastRound,
  updateBroadcastTournament,
  updateBroadcastRound,
  resetBroadcastRound,
  pushBroadcastRoundPgn
} from '../api/broadcasts';
import { useAuth } from './useAuth';

/**
 * Hook for fetching official broadcasts
 * 
 * @param page - Page number
 */
export function useOfficialBroadcasts(page: number = 1) {
  const [broadcasts, setBroadcasts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchBroadcasts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const broadcastsData = await getOfficialBroadcasts(page);
      setBroadcasts(broadcastsData || []);
      
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchBroadcasts();
  }, [fetchBroadcasts]);

  return {
    broadcasts,
    loading,
    error,
    refresh: fetchBroadcasts
  };
}

/**
 * Hook for fetching top broadcasts
 * 
 * @param page - Page number
 */
export function useTopBroadcasts(page: number = 1) {
  const [broadcasts, setBroadcasts] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchBroadcasts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const broadcastsData = await getTopBroadcasts(page);
      setBroadcasts(broadcastsData);
      
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchBroadcasts();
  }, [fetchBroadcasts]);

  return {
    broadcasts,
    loading,
    error,
    refresh: fetchBroadcasts
  };
}

/**
 * Hook for fetching broadcasts created by a user
 * 
 * @param username - Username to fetch broadcasts for
 * @param page - Page number
 */
export function useUserBroadcasts(username: string | null, page: number = 1) {
  const [broadcasts, setBroadcasts] = useState<any | null>(null);
  const [loading, setLoading] = useState(!!username);
  const [error, setError] = useState<Error | null>(null);

  const fetchBroadcasts = useCallback(async () => {
    if (!username) {
      setBroadcasts(null);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const broadcastsData = await getUserBroadcasts(username, page);
      setBroadcasts(broadcastsData);
      
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [username, page]);

  useEffect(() => {
    fetchBroadcasts();
  }, [fetchBroadcasts]);

  return {
    broadcasts,
    loading,
    error,
    refresh: fetchBroadcasts
  };
}

/**
 * Hook for fetching a broadcast tournament
 * 
 * @param tournamentId - Tournament ID
 */
export function useBroadcastTournament(tournamentId: string | null) {
  const [tournament, setTournament] = useState<any | null>(null);
  const [loading, setLoading] = useState(!!tournamentId);
  const [error, setError] = useState<Error | null>(null);

  const fetchTournament = useCallback(async () => {
    if (!tournamentId) {
      setTournament(null);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const tournamentData = await getBroadcastTournament(tournamentId);
      setTournament(tournamentData);
      
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [tournamentId]);

  useEffect(() => {
    fetchTournament();
  }, [fetchTournament]);

  return {
    tournament,
    loading,
    error,
    refresh: fetchTournament
  };
}

/**
 * Hook for fetching a broadcast round
 * 
 * @param tournamentSlug - Tournament slug
 * @param roundSlug - Round slug
 * @param roundId - Round ID
 */
export function useBroadcastRound(roundId: string | null) {
    const [round, setRound] = useState<any | null>(null);
    const [pgn, setPgn] = useState<string | null>(null);
    const [loading, setLoading] = useState(!!roundId);
    const [error, setError] = useState<Error | null>(null);
  
    const fetchRound = useCallback(async () => {
      if (!roundId) {
        setRound(null);
        setPgn(null);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        
        // Note: We don't have a direct endpoint to get a single round by ID
        // So instead, we'll just try to get its PGN content
        const pgnData = await exportBroadcastRoundPgn(roundId);
        setPgn(pgnData);
        
        // If we need more round data, we might need to implement a specific API
        // or get it from elsewhere in the application state
        
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setLoading(false);
      }
    }, [roundId]);
  
    useEffect(() => {
      fetchRound();
    }, [fetchRound]);
  
    return {
      round,
      pgn,
      loading,
      error,
      refresh: fetchRound
    };
  }
  
/**
 * Hook for managing broadcast actions
 */
export function useBroadcastActions() {
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Create a broadcast tournament
   */
  const createTournament = useCallback(async (data: {
    name: string;
    description?: string;
    source?: string;
    markdown?: string;
    credits?: string;
    autoLeaderboard?: boolean;
  }) => {
    if (!isAuthenticated) {
      throw new Error('Authentication required');
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const result = await createBroadcastTournament(data);
      return result;
      
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  /**
   * Create a broadcast round
   */
  const createRound = useCallback(async (
    tournamentId: string,
    data: {
      name: string;
      description?: string;
      syncUrl?: string;
      syncUrls?: string;
      syncIds?: string;
      syncUsers?: string;
      startsAt?: string;
      delay?: number;
    }
  ) => {
    if (!isAuthenticated) {
      throw new Error('Authentication required');
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const result = await createBroadcastRound(tournamentId, data);
      return result;
      
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  /**
   * Update a broadcast tournament
   */
  const updateTournament = useCallback(async (
    tournamentId: string,
    data: {
      name: string;
      description?: string;
      source?: string;
      markdown?: string;
      credits?: string;
      autoLeaderboard?: boolean;
    }
  ) => {
    if (!isAuthenticated) {
      throw new Error('Authentication required');
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const result = await updateBroadcastTournament(tournamentId, data);
      return result;
      
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  /**
   * Update a broadcast round
   */
  const updateRound = useCallback(async (
    roundId: string,
    data: {
      name: string;
      description?: string;
      syncUrl?: string;
      syncUrls?: string;
      syncIds?: string;
      syncUsers?: string;
      startsAt?: string;
      delay?: number;
    }
  ) => {
    if (!isAuthenticated) {
      throw new Error('Authentication required');
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const result = await updateBroadcastRound(roundId, data);
      return result;
      
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  /**
   * Push PGN to a broadcast round
   */
  const pushPgn = useCallback(async (roundId: string, pgn: string) => {
    if (!isAuthenticated) {
      throw new Error('Authentication required');
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const result = await pushBroadcastRoundPgn(roundId, pgn);
      return result;
      
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  /**
   * Reset a broadcast round
   */
  const resetRound = useCallback(async (roundId: string) => {
    if (!isAuthenticated) {
      throw new Error('Authentication required');
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const result = await resetBroadcastRound(roundId);
      return result;
      
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  return {
    loading,
    error,
    createTournament,
    createRound,
    updateTournament,
    updateRound,
    pushPgn,
    resetRound
  };
}

export function useMyBroadcastRounds() {
    const { isAuthenticated } = useAuth();
    const [rounds, setRounds] = useState<any[] | null>(null);
    const [loading, setLoading] = useState(isAuthenticated);
    const [error, setError] = useState<Error | null>(null);
  
    const fetchMyRounds = useCallback(async () => {
      if (!isAuthenticated) {
        setRounds(null);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        
        const roundsData = await getMyBroadcastRounds();
        setRounds(roundsData);
        
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setLoading(false);
      }
    }, [isAuthenticated]);
  
    useEffect(() => {
      fetchMyRounds();
    }, [fetchMyRounds]);
  
    return {
      rounds,
      loading,
      error,
      refresh: fetchMyRounds
    };
  }