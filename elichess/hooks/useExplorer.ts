//@ts-ignore
import { useState, useCallback } from 'react';
import { 
  queryMastersDatabase, 
  queryLichessDatabase, 
  queryPlayerDatabase, 
  getMasterGamePgn,
  MastersOptions,
  LichessExplorerOptions,
  PlayerExplorerOptions
} from '../api/explorer';

/**
 * Hook for accessing the masters database
 */
export function useMastersExplorer() {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const query = useCallback(async (options: MastersOptions) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await queryMastersDatabase(options);
      setData(result);
      return result;
      
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getPgn = useCallback(async (gameId: string) => {
    try {
      const pgn = await getMasterGamePgn(gameId);
      return pgn;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      return null;
    }
  }, []);

  return {
    data,
    loading,
    error,
    query,
    getPgn
  };
}

/**
 * Hook for accessing the Lichess database
 */
export function useLichessExplorer() {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const query = useCallback(async (options: LichessExplorerOptions) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await queryLichessDatabase(options);
      setData(result);
      return result;
      
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    data,
    loading,
    error,
    query
  };
}

/**
 * Hook for accessing a player's opening repertoire
 */
export function usePlayerExplorer() {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const query = useCallback(async (options: PlayerExplorerOptions) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await queryPlayerDatabase(options);
      setData(result);
      return result;
      
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    data,
    loading,
    error,
    query
  };
}