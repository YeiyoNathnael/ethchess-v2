import { getSession } from '../auth/session';
import { buildApiUrl } from './index';

/**
 * Export one study chapter in PGN format
 * 
 * @param studyId - Study ID
 * @param chapterId - Chapter ID
 * @param options - Export options
 * @returns PGN string or null on error
 */
export async function exportStudyChapter(
  studyId: string, 
  chapterId: string,
  options: {
    comments?: boolean;
    variations?: boolean;
    opening?: boolean;
    clocks?: boolean;
    orientation?: 'white' | 'black';
  } = {}
) {
  try {
    const params: Record<string, string> = {};
    
    if (options.comments !== undefined) params.comments = String(options.comments);
    if (options.variations !== undefined) params.variations = String(options.variations);
    if (options.opening !== undefined) params.opening = String(options.opening);
    if (options.clocks !== undefined) params.clocks = String(options.clocks);
    if (options.orientation) params.orientation = options.orientation;
    
    const response = await fetch(buildApiUrl(`study/${studyId}/${chapterId}.pgn`, params));
    
    if (!response.ok) {
      throw new Error(`Lichess API error: ${response.status}`);
    }
    
    return await response.text();
  } catch (error) {
    console.error(`Error exporting study chapter ${studyId}/${chapterId}:`, error);
    return null;
  }
}

/**
 * Export all chapters of a study in PGN format
 * 
 * @param studyId - Study ID
 * @param options - Export options
 * @returns PGN string or null on error
 */
export async function exportStudy(
  studyId: string,
  options: {
    comments?: boolean;
    variations?: boolean;
    opening?: boolean;
    clocks?: boolean;
    orientation?: 'white' | 'black';
  } = {}
) {
  try {
    const params: Record<string, string> = {};
    
    if (options.comments !== undefined) params.comments = String(options.comments);
    if (options.variations !== undefined) params.variations = String(options.variations);
    if (options.opening !== undefined) params.opening = String(options.opening);
    if (options.clocks !== undefined) params.clocks = String(options.clocks);
    if (options.orientation) params.orientation = options.orientation;
    
    const response = await fetch(buildApiUrl(`study/${studyId}.pgn`, params));
    
    if (!response.ok) {
      throw new Error(`Lichess API error: ${response.status}`);
    }
    
    return await response.text();
  } catch (error) {
    console.error(`Error exporting study ${studyId}:`, error);
    return null;
  }
}

/**
 * Get study metadata
 * 
 * @param studyId - Study ID
 * @returns Study metadata including Last-Modified header
 */
export async function getStudyMetadata(studyId: string) {
  try {
    const response = await fetch(buildApiUrl(`study/${studyId}.pgn`), {
      method: 'HEAD'
    });
    
    if (!response.ok) {
      throw new Error(`Lichess API error: ${response.status}`);
    }
    
    const lastModified = response.headers.get('Last-Modified');
    return { lastModified };
  } catch (error) {
    console.error(`Error getting study metadata ${studyId}:`, error);
    return null;
  }
}

/**
 * Import PGN into an existing study
 * 
 * @param studyId - Study ID
 * @param pgn - PGN content to import
 * @param options - Import options
 * @returns Result of the import operation
 */
export async function importPgnToStudy(
  studyId: string,
  pgn: string,
  options: {
    name?: string;
    variant?: string;
    mode?: 'normal' | 'practice' | 'conceal' | 'gamebook';
    initial?: boolean;
    sticky?: boolean;
  } = {}
) {
  const session = await getSession();
  if (!session?.accessToken) {
    throw new Error('Authentication required');
  }
  
  try {
    const formData = new FormData();
    formData.append('pgn', pgn);
    
    if (options.name) formData.append('name', options.name);
    if (options.variant) formData.append('variant', options.variant);
    if (options.mode) formData.append('mode', options.mode);
    if (options.initial !== undefined) formData.append('initial', String(options.initial));
    if (options.sticky !== undefined) formData.append('sticky', String(options.sticky));
    
    const response = await fetch(buildApiUrl(`study/${studyId}/import-pgn`), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`
      },
      body: formData
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to import PGN: ${errorText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error importing PGN to study ${studyId}:`, error);
    throw error;
  }
}

/**
 * Export all studies of a user
 * 
 * @param username - Username to export studies for
 * @param options - Export options
 * @returns PGN string or null on error
 */
export async function exportUserStudies(
  username: string,
  options: {
    comments?: boolean;
    variations?: boolean;
    opening?: boolean;
    clocks?: boolean;
    orientation?: 'white' | 'black';
  } = {}
) {
  const session = await getSession();
  const headers: HeadersInit = {};
  
  if (session?.accessToken) {
    headers['Authorization'] = `Bearer ${session.accessToken}`;
  }
  
  try {
    const params: Record<string, string> = {};
    
    if (options.comments !== undefined) params.comments = String(options.comments);
    if (options.variations !== undefined) params.variations = String(options.variations);
    if (options.opening !== undefined) params.opening = String(options.opening);
    if (options.clocks !== undefined) params.clocks = String(options.clocks);
    if (options.orientation) params.orientation = options.orientation;
    
    const response = await fetch(`https://lichess.org/study/by/${username}/export.pgn`, {
      headers,
      method: 'GET'
    });
    
    if (!response.ok) {
      throw new Error(`Lichess API error: ${response.status}`);
    }
    
    return await response.text();
  } catch (error) {
    console.error(`Error exporting studies for user ${username}:`, error);
    return null;
  }
}

/**
 * List metadata of all studies of a user
 * 
 * @param username - Username to list studies for
 * @returns List of study metadata or null on error
 */
export async function listUserStudies(username: string) {
  const session = await getSession();
  const headers: HeadersInit = {};
  
  if (session?.accessToken) {
    headers['Authorization'] = `Bearer ${session.accessToken}`;
  }
  
  try {
    const response = await fetch(buildApiUrl(`study/by/${username}`), {
      headers
    });
    
    if (!response.ok) {
      throw new Error(`Lichess API error: ${response.status}`);
    }
    
    // Response is ndjson, parse each line
    const text = await response.text();
    return text.trim().split('\n').map(line => JSON.parse(line));
  } catch (error) {
    console.error(`Error listing studies for user ${username}:`, error);
    return null;
  }
}

/**
 * Delete a study chapter
 * 
 * @param studyId - Study ID
 * @param chapterId - Chapter ID
 * @returns Success status
 */
export async function deleteStudyChapter(studyId: string, chapterId: string) {
  const session = await getSession();
  if (!session?.accessToken) {
    throw new Error('Authentication required');
  }
  
  try {
    const response = await fetch(buildApiUrl(`study/${studyId}/${chapterId}`), {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to delete chapter: ${errorText}`);
    }
    
    return true;
  } catch (error) {
    console.error(`Error deleting study chapter ${studyId}/${chapterId}:`, error);
    throw error;
  }
}