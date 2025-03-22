//@ts-ignore
import { useState, useEffect, useCallback } from 'react';
import { getFidePlayer, searchFidePlayers } from '../api/fide';

/**
 * Hook for fetching a FIDE player profile
 * 
 * @param playerId - FIDE ID of the player
 */
export function useFidePlayer(playerId: string | null) {
  const [player, setPlayer] = useState<any | null>(null);
  const [loading, setLoading] = useState(!!playerId);
  const [error, setError] = useState<Error | null>(null);

  const fetchPlayer = useCallback(async () => {
    if (!playerId) {
      setPlayer(null);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const playerData = await getFidePlayer(playerId);
      setPlayer(playerData);
      
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [playerId]);

  useEffect(() => {
    fetchPlayer();
  }, [fetchPlayer]);

  return {
    player,
    loading,
    error,
    refresh: fetchPlayer
  };
}

/**
 * Hook for searching FIDE players
 */
export function useFideSearch() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const search = useCallback(async (query: string) => {
    if (!query || query.trim().length < 2) {
      setResults([]);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const searchResults = await searchFidePlayers(query);
      setResults(searchResults || []);
      return searchResults;
      
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    results,
    loading,
    error,
    search
  };
}