import { getSession } from '../auth/session';
import { buildApiUrl, RequestOptions } from './index';

/**
 * Get the Lichess daily puzzle
 */
export async function getDailyPuzzle(options: RequestOptions = {}): Promise<any> {
  try {
    const response = await fetch(buildApiUrl('puzzle/daily', {}, options));
    
    if (!response.ok) {
      throw new Error(`Lichess API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching daily puzzle:', error);
    return null;
  }
}

/**
 * Get puzzle by ID
 * 
 * @param puzzleId - The ID of the puzzle to fetch
 */
export async function getPuzzleById(puzzleId: string, options: RequestOptions = {}): Promise<any> {
  try {
    const response = await fetch(buildApiUrl(`puzzle/${puzzleId}`, {}, options));
    
    if (!response.ok) {
      throw new Error(`Lichess API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching puzzle ${puzzleId}:`, error);
    return null;
  }
}

/**
 * Get a new puzzle (recommendation based on user level)
 * Requires authentication
 */
export async function getNextPuzzle(options: RequestOptions = {}): Promise<any> {
  const session = await getSession();
  if (!session?.accessToken) return null;
  
  try {
    const response = await fetch(buildApiUrl('puzzle/next', {}, options), {
      headers: {
        'Authorization': `Bearer ${session.accessToken}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Lichess API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching next puzzle:', error);
    return null;
  }
}

/**
 * Get user's puzzle activity
 * Requires authentication
 * 
 * @param max - Maximum number of entries to fetch
 */
export async function getPuzzleActivity(max?: number): Promise<any[]> {
  const session = await getSession();
  if (!session?.accessToken) return [];
  
  const params: Record<string, string> = {};
  if (max) params.max = max.toString();
  
  try {
    const response = await fetch(buildApiUrl('puzzle/activity', params), {
      headers: {
        'Authorization': `Bearer ${session.accessToken}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Lichess API error: ${response.status}`);
    }
    
    // This returns ndjson
    const text = await response.text();
    return text.trim().split('\n').map(line => JSON.parse(line));
  } catch (error) {
    console.error('Error fetching puzzle activity:', error);
    return [];
  }
}

/**
 * Get puzzle dashboard
 * Requires authentication
 * 
 * @param days - Number of days to include
 */
export async function getPuzzleDashboard(days: number = 30): Promise<any> {
  const session = await getSession();
  if (!session?.accessToken) return null;
  
  try {
    const response = await fetch(buildApiUrl(`puzzle/dashboard/${days}`), {
      headers: {
        'Authorization': `Bearer ${session.accessToken}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Lichess API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching puzzle dashboard:', error);
    return null;
  }
}