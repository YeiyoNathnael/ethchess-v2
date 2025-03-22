import { getSession } from '../auth/session';
import { buildApiUrl } from './index';

/**
 * Get information about a single team
 * 
 * @param teamId - The ID of the team to fetch
 * @returns Team data or null on error
 */
export async function getTeam(teamId: string) {
  try {
    const response = await fetch(buildApiUrl(`team/${teamId}`));
    
    if (!response.ok) {
      throw new Error(`Lichess API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching team ${teamId}:`, error);
    return null;
  }
}

/**
 * Search for teams by keyword
 * 
 * @param query - Search term
 * @param page - Page number (1-indexed)
 * @returns Paginated list of teams
 */
export async function searchTeams(query: string, page: number = 1) {
  try {
    const params: Record<string, string> = {
      text: query,
      page: page.toString()
    };
    
    const response = await fetch(buildApiUrl('team/search', params));
    
    if (!response.ok) {
      throw new Error(`Lichess API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error searching teams:', error);
    return null;
  }
}

/**
 * Get all teams a player belongs to
 * 
 * @param username - The username to get teams for
 * @returns List of teams or null on error
 */
export async function getUserTeams(username: string) {
  try {
    const response = await fetch(buildApiUrl(`team/of/${username}`));
    
    if (!response.ok) {
      throw new Error(`Lichess API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching teams for user ${username}:`, error);
    return null;
  }
}

/**
 * Get members of a team
 * 
 * @param teamId - The ID of the team
 * @returns Array of team members or null on error
 */
export async function getTeamMembers(teamId: string) {
  const session = await getSession();
  
  try {
    // For private teams, we need authentication
    const headers: HeadersInit = {};
    if (session?.accessToken) {
      headers['Authorization'] = `Bearer ${session.accessToken}`;
    }
    
    const response = await fetch(buildApiUrl(`team/${teamId}/users`), {
      headers
    });
    
    if (!response.ok) {
      throw new Error(`Lichess API error: ${response.status}`);
    }
    
    // Response is ndjson, parse each line
    const text = await response.text();
    return text.trim().split('\n').map(line => JSON.parse(line));
  } catch (error) {
    console.error(`Error fetching members for team ${teamId}:`, error);
    return null;
  }
}

/**
 * Join a team
 * 
 * @param teamId - ID of the team to join
 * @param password - Password (if the team requires it)
 * @param message - Message to the team leader (if join requests need approval)
 * @returns Success status or error message
 */
export async function joinTeam(teamId: string, password?: string, message?: string) {
  const session = await getSession();
  if (!session?.accessToken) {
    throw new Error('Authentication required');
  }
  
  try {
    const body = new URLSearchParams();
    if (password) body.append('password', password);
    if (message) body.append('message', message);
    
    const response = await fetch(`https://lichess.org/team/${teamId}/join`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: body.toString()
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to join team: ${errorText}`);
    }
    
    return true;
  } catch (error) {
    console.error(`Error joining team ${teamId}:`, error);
    throw error;
  }
}

/**
 * Leave a team
 * 
 * @param teamId - ID of the team to leave
 * @returns Success status
 */
export async function leaveTeam(teamId: string) {
  const session = await getSession();
  if (!session?.accessToken) {
    throw new Error('Authentication required');
  }
  
  try {
    const response = await fetch(`https://lichess.org/team/${teamId}/quit`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to leave team: ${errorText}`);
    }
    
    return true;
  } catch (error) {
    console.error(`Error leaving team ${teamId}:`, error);
    throw error;
  }
}

/**
 * Get join requests for a team you manage
 * 
 * @param teamId - ID of the team
 * @returns List of join requests
 */
export async function getTeamJoinRequests(teamId: string) {
  const session = await getSession();
  if (!session?.accessToken) {
    throw new Error('Authentication required');
  }
  
  try {
    const response = await fetch(buildApiUrl(`team/${teamId}/requests`), {
      headers: {
        'Authorization': `Bearer ${session.accessToken}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Lichess API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching join requests for team ${teamId}:`, error);
    throw error;
  }
}

/**
 * Accept a join request
 * 
 * @param teamId - ID of the team
 * @param userId - User ID to accept
 * @returns Success status
 */
export async function acceptJoinRequest(teamId: string, userId: string) {
  const session = await getSession();
  if (!session?.accessToken) {
    throw new Error('Authentication required');
  }
  
  try {
    const response = await fetch(buildApiUrl(`team/${teamId}/request/${userId}/accept`), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to accept join request: ${errorText}`);
    }
    
    return true;
  } catch (error) {
    console.error(`Error accepting join request for team ${teamId}:`, error);
    throw error;
  }
}

/**
 * Decline a join request
 * 
 * @param teamId - ID of the team
 * @param userId - User ID to decline
 * @returns Success status
 */
export async function declineJoinRequest(teamId: string, userId: string) {
  const session = await getSession();
  if (!session?.accessToken) {
    throw new Error('Authentication required');
  }
  
  try {
    const response = await fetch(buildApiUrl(`team/${teamId}/request/${userId}/decline`), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to decline join request: ${errorText}`);
    }
    
    return true;
  } catch (error) {
    console.error(`Error declining join request for team ${teamId}:`, error);
    throw error;
  }
}

/**
 * Kick a user from your team
 * 
 * @param teamId - ID of the team
 * @param userId - User ID to kick
 * @returns Success status
 */
export async function kickTeamMember(teamId: string, userId: string) {
  const session = await getSession();
  if (!session?.accessToken) {
    throw new Error('Authentication required');
  }
  
  try {
    const response = await fetch(buildApiUrl(`team/${teamId}/kick/${userId}`), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to kick team member: ${errorText}`);
    }
    
    return true;
  } catch (error) {
    console.error(`Error kicking user ${userId} from team ${teamId}:`, error);
    throw error;
  }
}

/**
 * Message all members of a team
 * 
 * @param teamId - ID of the team
 * @param message - Message to send to all members
 * @returns Success status
 */
export async function messageAllTeamMembers(teamId: string, message: string) {
  const session = await getSession();
  if (!session?.accessToken) {
    throw new Error('Authentication required');
  }
  
  try {
    const response = await fetch(`https://lichess.org/team/${teamId}/pm-all`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to message team: ${errorText}`);
    }
    
    return true;
  } catch (error) {
    console.error(`Error messaging all members of team ${teamId}:`, error);
    throw error;
  }
}