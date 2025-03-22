import { buildApiUrl } from './index';

/**
 * Get information about a FIDE player
 * 
 * @param playerId - FIDE player ID
 * @returns Player information or null on error
 */
export async function getFidePlayer(playerId: string) {
  try {
    const response = await fetch(buildApiUrl(`fide/player/${playerId}`));
    
    if (!response.ok) {
      throw new Error(`Lichess API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching FIDE player ${playerId}:`, error);
    return null;
  }
}

/**
 * Search for FIDE players
 * 
 * @param query - Search query (name or ID)
 * @returns Search results or null on error
 */
export async function searchFidePlayers(query: string) {
  try {
    const params: Record<string, string> = {
      query
    };
    
    const response = await fetch(buildApiUrl('fide/player', params));
    
    if (!response.ok) {
      throw new Error(`Lichess API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error searching FIDE players:', error);
    return null;
  }
}