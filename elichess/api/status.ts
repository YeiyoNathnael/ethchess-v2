import { buildApiUrl, RequestOptions } from './index';

/**
 * Get real-time status of multiple users
 * 
 * @param userIds - Array of user IDs to check status
 * @param withGameIds - Whether to include IDs of games being played
 */
export async function getUsersStatus(
  userIds: string[], 
  withGameIds: boolean = false,
  options: RequestOptions = {}
): Promise<any[]> {
  if (userIds.length === 0) return [];
  
  // Maximum 50 users per request as per API docs
  const ids = userIds.slice(0, 50).join(',');
  
  const params: Record<string, string> = {
    ids
  };
  
  if (withGameIds) {
    params.withGameIds = 'true';
  }
  
  try {
    const response = await fetch(buildApiUrl('users/status', params, options));
    
    if (!response.ok) {
      throw new Error(`Lichess API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching users status:', error);
    return [];
  }
}

/**
 * Get current live streamers
 */
export async function getLiveStreamers(options: RequestOptions = {}): Promise<any[]> {
  try {
    const response = await fetch(buildApiUrl('streamer/live', {}, options));
    
    if (!response.ok) {
      throw new Error(`Lichess API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching live streamers:', error);
    return [];
  }
}

/**
 * Get top players for each variant and speed
 */
export async function getTopPlayers(options: RequestOptions = {}): Promise<any> {
  try {
    const response = await fetch(buildApiUrl('player', {}, options));
    
    if (!response.ok) {
      throw new Error(`Lichess API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching top players:', error);
    return null;
  }
}

/**
 * Get leaderboard for a specific category
 * 
 * @param perfType - The performance category (e.g., 'bullet', 'blitz', 'rapid')
 * @param nb - Number of players to get (max 200)
 */
export async function getLeaderboard(
  perfType: string, 
  nb: number = 100,
  options: RequestOptions = {}
): Promise<any> {
  try {
    const response = await fetch(buildApiUrl(`player/top/${Math.min(nb, 200)}/${perfType}`, {}, options));
    
    if (!response.ok) {
      throw new Error(`Lichess API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching ${perfType} leaderboard:`, error);
    return null;
  }
}