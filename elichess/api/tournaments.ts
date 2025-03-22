import { getSession } from '../auth/session';
import { LichessTournament, LichessVariantKey } from '../types';
import { buildApiUrl } from './index';

/**
 * Options for creating a tournament
 */
export interface CreateTournamentOptions {
  /** Tournament name */
  name: string;
  /** Clock time in minutes */
  clockTime: number;
  /** Clock increment in seconds */
  clockIncrement: number;
  /** Tournament duration in minutes */
  minutes: number;
  /** Minutes until the tournament starts */
  waitMinutes: number;
  /** Game variant */
  variant?: LichessVariantKey;
  /** Tournament description */
  description?: string;
  /** Whether players can use berserk mode */
  berserkable?: boolean;
  /** Password to restrict entry (if any) */
  password?: string;
  /** Minimum rating to join */
  minRating?: number;
  /** Maximum rating to join */
  maxRating?: number;
  /** Team ID for team tournaments */
  teamId?: string;
}

/**
 * Creates a tournament on Lichess
 * Requires 'tournament:write' scope
 * 
 * @param options - Tournament creation options
 * @returns Tournament data or throws error
 */
export async function createTournament(options: CreateTournamentOptions) {
  const session = await getSession();
  if (!session?.accessToken) {
    throw new Error('Not authenticated');
  }
  
  try {
    // Prepare form parameters
    const params: Record<string, string> = {
      name: options.name,
      clockTime: options.clockTime.toString(),
      clockIncrement: options.clockIncrement.toString(),
      minutes: options.minutes.toString(),
      waitMinutes: options.waitMinutes.toString(),
      variant: options.variant || 'standard',
    };
    
    // Add optional parameters
    if (options.description) params.description = options.description;
    if (options.berserkable !== undefined) params.berserkable = options.berserkable.toString();
    if (options.password) params.password = options.password;
    if (options.minRating) params.conditions_minRating = options.minRating.toString();
    if (options.maxRating) params.conditions_maxRating = options.maxRating.toString();
    if (options.teamId) params['conditions.teamMember.teamId'] = options.teamId;
    
    // Create URL-encoded form body
    const formBody = new URLSearchParams(params);
    
    const response = await fetch(buildApiUrl('tournament'), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formBody
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create tournament: ${errorText}`);
    }
    
    const tournament = await response.json();
    
    return {
      id: tournament.id,
      url: tournament.url || `https://lichess.org/tournament/${tournament.id}`,
      tournament
    };
  } catch (error) {
    console.error('Error creating tournament:', error);
    throw error;
  }
}

/**
 * Fetches upcoming and ongoing tournaments
 * 
 * @returns Array of tournaments or empty array on error
 */
export async function fetchTournaments(): Promise<LichessTournament[]> {
  try {
    const response = await fetch(buildApiUrl('tournament'));
    
    if (!response.ok) {
      throw new Error(`Lichess API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Filter and sort tournaments
    const upcomingTournaments = [
      ...(data.created || []),
      ...(data.started || [])
    ].sort((a: LichessTournament, b: LichessTournament) => a.startsAt - b.startsAt);
    
    return upcomingTournaments;
  } catch (error) {
    console.error('Error fetching tournaments:', error);
    return [];
  }
}

/**
 * Joins a tournament
 * Requires 'tournament:write' scope
 * 
 * @param tournamentId - Tournament ID to join
 * @param password - Optional password for private tournaments
 * @returns Success status
 */
export async function joinTournament(
    tournamentId: string, 
    password?: string
  ): Promise<boolean> {
    const session = await getSession();
    if (!session?.accessToken) {
      throw new Error('Not authenticated');
    }
    
    try {
      // Fix the type error by creating a proper Record<string, string>
      const params: Record<string, string> = {};
      // Only add password if it exists
      if (password) {
        params.password = password;
      }
      
      const response = await fetch(buildApiUrl(`tournament/${tournamentId}/join`, params), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.accessToken}`
        }
      });
      
      return response.ok;
    } catch (error) {
      console.error(`Error joining tournament ${tournamentId}:`, error);
      return false;
    }
  }

/**
 * Withdraws from a tournament
 * Requires 'tournament:write' scope
 * 
 * @param tournamentId - Tournament ID to withdraw from
 * @returns Success status
 */
export async function withdrawFromTournament(tournamentId: string): Promise<boolean> {
  const session = await getSession();
  if (!session?.accessToken) {
    throw new Error('Not authenticated');
  }
  
  try {
    const response = await fetch(buildApiUrl(`tournament/${tournamentId}/withdraw`), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`
      }
    });
    
    return response.ok;
  } catch (error) {
    console.error(`Error withdrawing from tournament ${tournamentId}:`, error);
    return false;
  }
}

/**
 * Fetches current user's active tournaments
 * 
 * @returns Array of tournaments or empty array on error
 */
export async function fetchMyTournaments(): Promise<any[]> {
  const session = await getSession();
  if (!session?.accessToken) {
    return [];
  }
  
  try {
    const response = await fetch(buildApiUrl('tournament/me'), {
      headers: {
        'Authorization': `Bearer ${session.accessToken}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Lichess API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching my tournaments:', error);
    return [];
  }
}