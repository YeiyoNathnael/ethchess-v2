//@ts-ignore
import { useState, useEffect, useCallback } from 'react';
import { 
  createGame, 
  challengePlayer, 
  fetchGameById,
  acceptChallenge,
  declineChallenge,
  exportGamePgn
} from '../api/games';
import { LichessGame, LichessVariantKey } from '../types';
import { useAuth } from './useAuth';

/**
 * Hook for creating a new game or challenge
 */
export function useCreateGame() {
  const { isAuthenticated } = useAuth();
  const [challengeData, setChallengeData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Create an open challenge
   */
  const createOpenChallenge = useCallback(async (options: {
    time: number;
    increment: number;
    color?: 'white' | 'black' | 'random';
    variant?: LichessVariantKey;
    ratingRange?: string;
  }) => {
    if (!isAuthenticated) {
      throw new Error('Authentication required');
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const result = await createGame(options);
      setChallengeData(result);
      return result;
      
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  /**
   * Challenge a specific player
   */
  const challenge = useCallback(async (username: string, options: {
    time: number;
    increment: number;
    color?: 'white' | 'black' | 'random';
    variant?: LichessVariantKey;
  }) => {
    if (!isAuthenticated) {
      throw new Error('Authentication required');
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const result = await challengePlayer(username, options);
      setChallengeData(result);
      return result;
      
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  return {
    challengeData,
    loading,
    error,
    createOpenChallenge,
    challengePlayer: challenge
  };
}

/**
 * Hook for managing challenges
 */
export function useChallenges() {
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Accept a challenge
   */
  const accept = useCallback(async (challengeId: string) => {
    if (!isAuthenticated) {
      throw new Error('Authentication required');
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const result = await acceptChallenge(challengeId);
      return result;
      
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      return false;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  /**
   * Decline a challenge
   */
  const decline = useCallback(async (
    challengeId: string, 
    reason?: 'generic' | 'later' | 'tooFast' | 'tooSlow' | 'timeControl' | 'rated' | 'casual' | 'standard' | 'variant' | 'noBot' | 'onlyBot'
  ) => {
    if (!isAuthenticated) {
      throw new Error('Authentication required');
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const result = await declineChallenge(challengeId, reason);
      return result;
      
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      return false;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  return {
    loading,
    error,
    acceptChallenge: accept,
    declineChallenge: decline
  };
}

/**
 * Hook for fetching and displaying a specific game
 * 
 * @param gameId - ID of the game to fetch
 */
export function useGame(gameId: string | null | undefined) {
  const { isAuthenticated } = useAuth();
  const [game, setGame] = useState<LichessGame | null>(null);
  const [pgn, setPgn] = useState<string | null>(null);
  const [loading, setLoading] = useState(!!gameId);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Fetch game data
   */
  const fetchGame = useCallback(async () => {
    if (!gameId) {
      setGame(null);
      setPgn(null);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Only fetch game data if authenticated
      if (isAuthenticated) {
        const gameData = await fetchGameById(gameId);
        setGame(gameData);
      }
      
      // PGN can be fetched without authentication
      const pgnData = await exportGamePgn(gameId);
      setPgn(pgnData);
      
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [gameId, isAuthenticated]);

  useEffect(() => {
    fetchGame();
  }, [fetchGame]);

  return {
    game,
    pgn,
    loading,
    error,
    refresh: fetchGame
  };
}