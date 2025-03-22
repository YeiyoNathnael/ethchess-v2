import { getSession } from '../auth/session';
import { LichessGame, LichessVariantKey } from '../types';
import { buildApiUrl } from './index';

/**
 * Options for creating a game
 */
export interface CreateGameOptions {
  /** Time in minutes for each player's clock */
  time: number;
  /** Increment in seconds added after each move */
  increment: number;
  /** Which color the player will have */
  color?: 'white' | 'black' | 'random';
  /** Chess variant to play */
  variant?: LichessVariantKey;
  /** Rating range filter for opponents */
  ratingRange?: string;
}

/**
 * Creates an open challenge on Lichess
 * Requires 'challenge:write' scope
 * 
 * @param options - Game creation options
 * @returns Challenge data or null on error
 */
export async function createGame(options: CreateGameOptions) {
  const session = await getSession();
  if (!session?.accessToken) {
    throw new Error('Not authenticated');
  }
  
  try {
    const response = await fetch(buildApiUrl('challenge/open'), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        clock: {
          limit: options.time * 60,
          increment: options.increment
        },
        color: options.color || 'random',
        variant: options.variant || 'standard',
        ...(options.ratingRange ? { ratingRange: options.ratingRange } : {})
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create game: ${errorText}`);
    }
    
    const challenge = await response.json();
    
    return {
      gameId: challenge.id,
      url: challenge.url || `https://lichess.org/${challenge.id}`,
      challenge
    };
  } catch (error) {
    console.error('Error creating game:', error);
    throw error;
  }
}

/**
 * Creates a challenge against another player
 * Requires 'challenge:write' scope
 * 
 * @param username - Username to challenge
 * @param options - Game options
 * @returns Challenge data or null on error
 */
export async function challengePlayer(
  username: string, 
  options: CreateGameOptions
) {
  const session = await getSession();
  if (!session?.accessToken) {
    throw new Error('Not authenticated');
  }
  
  try {
    const response = await fetch(buildApiUrl(`challenge/${username}`), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        clock: {
          limit: options.time * 60,
          increment: options.increment
        },
        color: options.color || 'random',
        variant: options.variant || 'standard'
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to challenge player: ${errorText}`);
    }
    
    const challenge = await response.json();
    
    return {
      challengeId: challenge.id,
      url: challenge.url || `https://lichess.org/${challenge.id}`,
      challenge
    };
  } catch (error) {
    console.error('Error challenging player:', error);
    throw error;
  }
}

/**
 * Accepts a challenge
 * Requires 'challenge:write' scope
 * 
 * @param challengeId - ID of the challenge to accept
 * @returns Success status
 */
export async function acceptChallenge(challengeId: string): Promise<boolean> {
  const session = await getSession();
  if (!session?.accessToken) return false;
  
  try {
    const response = await fetch(buildApiUrl(`challenge/${challengeId}/accept`), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`
      }
    });
    
    return response.ok;
  } catch (error) {
    console.error('Error accepting challenge:', error);
    return false;
  }
}

/**
 * Declines a challenge
 * Requires 'challenge:write' scope
 * 
 * @param challengeId - ID of the challenge to decline
 * @param reason - Reason for declining
 * @returns Success status
 */
export async function declineChallenge(
  challengeId: string, 
  reason: 'generic' | 'later' | 'tooFast' | 'tooSlow' | 'timeControl' | 'rated' | 'casual' | 'standard' | 'variant' | 'noBot' | 'onlyBot' = 'generic'
): Promise<boolean> {
  const session = await getSession();
  if (!session?.accessToken) return false;
  
  try {
    const response = await fetch(buildApiUrl(`challenge/${challengeId}/decline`), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        reason
      })
    });
    
    return response.ok;
  } catch (error) {
    console.error('Error declining challenge:', error);
    return false;
  }
}

/**
 * Fetches a specific game by ID
 * 
 * @param gameId - The game ID
 * @returns Game data or null on error
 */
export async function fetchGameById(gameId: string): Promise<LichessGame | null> {
  const session = await getSession();
  if (!session?.accessToken) return null;
  
  try {
    const response = await fetch(buildApiUrl(`game/${gameId}`), {
      headers: {
        'Authorization': `Bearer ${session.accessToken}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Lichess API error: ${response.status}`);
    }
    
    return await response.json() as LichessGame;
  } catch (error) {
    console.error(`Error fetching game ${gameId}:`, error);
    return null;
  }
}

/**
 * Exports a game in PGN format
 * 
 * @param gameId - The game ID
 * @returns PGN string or null on error
 */
export async function exportGamePgn(gameId: string): Promise<string | null> {
  try {
    const response = await fetch(`https://lichess.org/game/export/${gameId}?evals=false&clocks=false`, {
      headers: {
        'Accept': 'application/x-chess-pgn'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Lichess API error: ${response.status}`);
    }
    
    return await response.text();
  } catch (error) {
    console.error(`Error exporting game ${gameId}:`, error);
    return null;
  }
}