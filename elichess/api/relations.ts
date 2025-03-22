import { getSession } from '../auth/session';
import { buildApiUrl } from './index';

/**
 * Get users that the current user follows
 * 
 * @returns Array of followed users or null on error
 */
export async function getFollowing() {
  const session = await getSession();
  if (!session?.accessToken) {
    throw new Error('Authentication required');
  }
  
  try {
    const response = await fetch(buildApiUrl('rel/following'), {
      headers: {
        'Authorization': `Bearer ${session.accessToken}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Lichess API error: ${response.status}`);
    }
    
    // Response is ndjson, parse each line
    const text = await response.text();
    return text.trim().split('\n').map(line => JSON.parse(line));
  } catch (error) {
    console.error('Error fetching following list:', error);
    return null;
  }
}

/**
 * Follow a player
 * 
 * @param username - Username to follow
 * @returns Success status
 */
export async function followUser(username: string) {
  const session = await getSession();
  if (!session?.accessToken) {
    throw new Error('Authentication required');
  }
  
  try {
    const response = await fetch(buildApiUrl(`rel/follow/${username}`), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to follow user: ${errorText}`);
    }
    
    return true;
  } catch (error) {
    console.error(`Error following user ${username}:`, error);
    throw error;
  }
}

/**
 * Unfollow a player
 * 
 * @param username - Username to unfollow
 * @returns Success status
 */
export async function unfollowUser(username: string) {
  const session = await getSession();
  if (!session?.accessToken) {
    throw new Error('Authentication required');
  }
  
  try {
    const response = await fetch(buildApiUrl(`rel/unfollow/${username}`), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to unfollow user: ${errorText}`);
    }
    
    return true;
  } catch (error) {
    console.error(`Error unfollowing user ${username}:`, error);
    throw error;
  }
}

/**
 * Block a player
 * 
 * @param username - Username to block
 * @returns Success status
 */
export async function blockUser(username: string) {
  const session = await getSession();
  if (!session?.accessToken) {
    throw new Error('Authentication required');
  }
  
  try {
    const response = await fetch(buildApiUrl(`rel/block/${username}`), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to block user: ${errorText}`);
    }
    
    return true;
  } catch (error) {
    console.error(`Error blocking user ${username}:`, error);
    throw error;
  }
}

/**
 * Unblock a player
 * 
 * @param username - Username to unblock
 * @returns Success status
 */
export async function unblockUser(username: string) {
  const session = await getSession();
  if (!session?.accessToken) {
    throw new Error('Authentication required');
  }
  
  try {
    const response = await fetch(buildApiUrl(`rel/unblock/${username}`), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to unblock user: ${errorText}`);
    }
    
    return true;
  } catch (error) {
    console.error(`Error unblocking user ${username}:`, error);
    throw error;
  }
}