import { getSession } from '../auth/session';
import { buildApiUrl } from './index';

/**
 * Get official broadcasts
 * 
 * @returns List of official broadcasts sorted by start date
 */
export async function getOfficialBroadcasts(page: number = 1) {
  try {
    const params: Record<string, string> = {
      page: page.toString()
    };
    
    const response = await fetch(buildApiUrl('broadcast', params));
    
    if (!response.ok) {
      throw new Error(`Lichess API error: ${response.status}`);
    }
    
    // Response is ndjson, parse each line
    const text = await response.text();
    return text.trim().split('\n').map(line => JSON.parse(line));
  } catch (error) {
    console.error('Error fetching official broadcasts:', error);
    return [];
  }
}

/**
 * Get top broadcast previews
 * 
 * @param page - Page number
 * @returns Paginated list of top broadcasts
 */
export async function getTopBroadcasts(page: number = 1) {
  try {
    const params: Record<string, string> = {
      page: page.toString()
    };
    
    const response = await fetch(buildApiUrl('broadcast/top', params));
    
    if (!response.ok) {
      throw new Error(`Lichess API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching top broadcasts:', error);
    return null;
  }
}

/**
 * Get broadcasts created by a user
 * 
 * @param username - Username to fetch broadcasts for
 * @param page - Page number
 * @returns List of broadcasts created by the user
 */
export async function getUserBroadcasts(username: string, page: number = 1) {
  try {
    const params: Record<string, string> = {
      page: page.toString()
    };
    
    const response = await fetch(buildApiUrl(`broadcast/by/${username}`, params));
    
    if (!response.ok) {
      throw new Error(`Lichess API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching broadcasts for user ${username}:`, error);
    return null;
  }
}

/**
 * Create a broadcast tournament
 * 
 * @param data - Broadcast tournament data
 * @returns Created broadcast tournament
 */
export async function createBroadcastTournament(data: {
  name: string;
  description?: string;
  source?: string;
  markdown?: string;
  credits?: string;
  autoLeaderboard?: boolean;
}) {
  const session = await getSession();
  if (!session?.accessToken) {
    throw new Error('Authentication required');
  }
  
  try {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        formData.append(key, typeof value === 'boolean' ? String(value) : value);
      }
    });
    
    const response = await fetch('https://lichess.org/broadcast/new', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`
      },
      body: formData
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create broadcast: ${errorText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error creating broadcast tournament:', error);
    throw error;
  }
}

/**
 * Get a broadcast tournament
 * 
 * @param id - Broadcast tournament ID
 * @returns Broadcast tournament data
 */
export async function getBroadcastTournament(id: string) {
  try {
    const response = await fetch(buildApiUrl(`broadcast/${id}`));
    
    if (!response.ok) {
      throw new Error(`Lichess API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching broadcast tournament ${id}:`, error);
    return null;
  }
}

/**
 * Get players of a broadcast
 * 
 * @param id - Broadcast tournament ID
 * @returns List of players in the broadcast
 */
export async function getBroadcastPlayers(id: string) {
  try {
    const response = await fetch(`https://lichess.org/broadcast/${id}/players`);
    
    if (!response.ok) {
      throw new Error(`Lichess API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching players for broadcast ${id}:`, error);
    return null;
  }
}

/**
 * Update a broadcast tournament
 * 
 * @param id - Broadcast tournament ID
 * @param data - Updated broadcast tournament data
 * @returns Updated broadcast tournament
 */
export async function updateBroadcastTournament(
  id: string,
  data: {
    name: string;
    description?: string;
    source?: string;
    markdown?: string;
    credits?: string;
    autoLeaderboard?: boolean;
  }
) {
  const session = await getSession();
  if (!session?.accessToken) {
    throw new Error('Authentication required');
  }
  
  try {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        formData.append(key, typeof value === 'boolean' ? String(value) : value);
      }
    });
    
    const response = await fetch(`https://lichess.org/broadcast/${id}/edit`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`
      },
      body: formData
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to update broadcast: ${errorText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error updating broadcast tournament ${id}:`, error);
    throw error;
  }
}
/**
 * Create a broadcast round
 * 
 * @param tournamentId - Broadcast tournament ID
 * @param data - Broadcast round data
 * @returns Created broadcast round
 */
export async function createBroadcastRound(
    tournamentId: string,
    data: {
      name: string;
      description?: string;
      syncUrl?: string;
      syncUrls?: string;
      syncIds?: string;
      syncUsers?: string;
      startsAt?: string;
      delay?: number;
    }
  ) {
    const session = await getSession();
    if (!session?.accessToken) {
      throw new Error('Authentication required');
    }
    
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined) {
          // Convert any value to string before appending to FormData
          formData.append(key, String(value));
        }
      });
      
      const response = await fetch(`https://lichess.org/broadcast/${tournamentId}/new`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.accessToken}`
        },
        body: formData
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create broadcast round: ${errorText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error creating broadcast round for tournament ${tournamentId}:`, error);
      throw error;
    }
  }
  
  /**
   * Update a broadcast round
   * 
   * @param roundId - Round ID
   * @param data - Updated broadcast round data
   * @returns Updated broadcast round
   */
  export async function updateBroadcastRound(
    roundId: string,
    data: {
      name: string;
      description?: string;
      syncUrl?: string;
      syncUrls?: string;
      syncIds?: string;
      syncUsers?: string;
      startsAt?: string;
      delay?: number;
    }
  ) {
    const session = await getSession();
    if (!session?.accessToken) {
      throw new Error('Authentication required');
    }
    
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined) {
          // Convert any value to string before appending to FormData
          formData.append(key, String(value));
        }
      });
      
      const response = await fetch(`https://lichess.org/broadcast/round/${roundId}/edit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.accessToken}`
        },
        body: formData
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update broadcast round: ${errorText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error updating broadcast round ${roundId}:`, error);
      throw error;
    }
  }

/**
 * Reset a broadcast round
 * 
 * @param roundId - Round ID
 * @returns Status of the reset operation
 */
export async function resetBroadcastRound(roundId: string) {
  const session = await getSession();
  if (!session?.accessToken) {
    throw new Error('Authentication required');
  }
  
  try {
    const response = await fetch(buildApiUrl(`broadcast/round/${roundId}/reset`), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to reset broadcast round: ${errorText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error resetting broadcast round ${roundId}:`, error);
    throw error;
  }
}

/**
 * Push PGN to a broadcast round
 * 
 * @param roundId - Round ID
 * @param pgn - PGN data to push
 * @returns Status of the push operation
 */
export async function pushBroadcastRoundPgn(roundId: string, pgn: string) {
  const session = await getSession();
  if (!session?.accessToken) {
    throw new Error('Authentication required');
  }
  
  try {
    const response = await fetch(buildApiUrl(`broadcast/round/${roundId}/push`), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'text/plain'
      },
      body: pgn
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to push PGN: ${errorText}`);
    }
    
    return true;
  } catch (error) {
    console.error(`Error pushing PGN to broadcast round ${roundId}:`, error);
    throw error;
  }
}

/**
 * Stream a broadcast round as PGN
 * 
 * @param roundId - Round ID
 * @returns Stream of PGN data
 */
export async function streamBroadcastRoundPgn(roundId: string) {
  try {
    const response = await fetch(buildApiUrl(`stream/broadcast/round/${roundId}.pgn`));
    
    if (!response.ok) {
      throw new Error(`Lichess API error: ${response.status}`);
    }
    
    return response.body;
  } catch (error) {
    console.error(`Error streaming broadcast round ${roundId}:`, error);
    return null;
  }
}

/**
 * Export a broadcast round as PGN
 * 
 * @param roundId - Round ID
 * @returns PGN data
 */
export async function exportBroadcastRoundPgn(roundId: string) {
  try {
    const response = await fetch(buildApiUrl(`broadcast/round/${roundId}.pgn`));
    
    if (!response.ok) {
      throw new Error(`Lichess API error: ${response.status}`);
    }
    
    return await response.text();
  } catch (error) {
    console.error(`Error exporting broadcast round ${roundId}:`, error);
    return null;
  }
}

/**
 * Export all rounds of a broadcast tournament as PGN
 * 
 * @param tournamentId - Tournament ID
 * @returns PGN data
 */
export async function exportBroadcastTournamentPgn(tournamentId: string) {
  const session = await getSession();
  const headers: HeadersInit = {};
  
  if (session?.accessToken) {
    headers['Authorization'] = `Bearer ${session.accessToken}`;
  }
  
  try {
    const response = await fetch(buildApiUrl(`broadcast/${tournamentId}.pgn`), {
      headers
    });
    
    if (!response.ok) {
      throw new Error(`Lichess API error: ${response.status}`);
    }
    
    return await response.text();
  } catch (error) {
    console.error(`Error exporting broadcast tournament ${tournamentId}:`, error);
    return null;
  }
}

/**
 * Get your broadcast rounds
 * 
 * @returns List of your broadcast rounds
 */
export async function getMyBroadcastRounds() {
  const session = await getSession();
  if (!session?.accessToken) {
    throw new Error('Authentication required');
  }
  
  try {
    const response = await fetch(buildApiUrl('broadcast/my-rounds'), {
      headers: {
        'Authorization': `Bearer ${session.accessToken}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Lichess API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching your broadcast rounds:', error);
    return null;
  }
}