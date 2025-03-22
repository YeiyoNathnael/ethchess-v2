//@ts-ignore
import { useState, useEffect, useCallback } from 'react';
import { 
  exportStudy, 
  exportStudyChapter, 
  getStudyMetadata,
  importPgnToStudy,
  exportUserStudies,
  listUserStudies,
  deleteStudyChapter
} from '../api/studies';
import { useAuth } from './useAuth';

/**
 * Hook for fetching a study or chapter
 * 
 * @param studyId - Study ID
 * @param chapterId - Optional chapter ID
 */
export function useStudy(studyId: string | null, chapterId?: string) {
  const [pgn, setPgn] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<any | null>(null);
  const [loading, setLoading] = useState(!!studyId);
  const [error, setError] = useState<Error | null>(null);

  const fetchStudy = useCallback(async () => {
    if (!studyId) {
      setPgn(null);
      setMetadata(null);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Get study metadata
      const metaData = await getStudyMetadata(studyId);
      setMetadata(metaData);
      
      // Get study PGN
      let pgnData;
      if (chapterId) {
        pgnData = await exportStudyChapter(studyId, chapterId);
      } else {
        pgnData = await exportStudy(studyId);
      }
      setPgn(pgnData);
      
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [studyId, chapterId]);

  useEffect(() => {
    fetchStudy();
  }, [fetchStudy]);

  return {
    pgn,
    metadata,
    loading,
    error,
    refresh: fetchStudy
  };
}

/**
 * Hook for fetching user studies
 * 
 * @param username - Username to fetch studies for
 */
export function useUserStudies(username: string | null) {
  const [studies, setStudies] = useState<any[]>([]);
  const [loading, setLoading] = useState(!!username);
  const [error, setError] = useState<Error | null>(null);

  const fetchUserStudies = useCallback(async () => {
    if (!username) {
      setStudies([]);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const studiesData = await listUserStudies(username);
      setStudies(studiesData || []);
      
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [username]);

  useEffect(() => {
    fetchUserStudies();
  }, [fetchUserStudies]);

  return {
    studies,
    loading,
    error,
    refresh: fetchUserStudies
  };
}

/**
 * Hook for study actions (import PGN, delete chapter)
 */
export function useStudyActions() {
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Import PGN to a study
   */
  const importPgn = useCallback(async (
    studyId: string, 
    pgn: string, 
    options?: {
      name?: string;
      variant?: string;
      mode?: 'normal' | 'practice' | 'conceal' | 'gamebook';
      initial?: boolean;
      sticky?: boolean;
    }
  ) => {
    if (!isAuthenticated) {
      throw new Error('Authentication required');
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const result = await importPgnToStudy(studyId, pgn, options);
      return result;
      
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  /**
   * Delete a study chapter
   */
  const deleteChapter = useCallback(async (studyId: string, chapterId: string) => {
    if (!isAuthenticated) {
      throw new Error('Authentication required');
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const result = await deleteStudyChapter(studyId, chapterId);
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
    importPgn,
    deleteChapter
  };
}