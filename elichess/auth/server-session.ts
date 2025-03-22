
import { cookies } from 'next/headers';
import { LichessSession, LichessUser } from '../types';
import { getConfig } from '../config';

/**
 * Retrieves the current user session from cookies
 * 
 * @returns The user session or null if not logged in
 */
export async function getSession(): Promise<LichessSession | null> {
  try {
    const config = getConfig();
    const cookieStore = cookies();
    const sessionCookie = (await cookieStore).get(config.cookies.session.name);
    
    if (!sessionCookie?.value) {
      return null;
    }
    
    return JSON.parse(sessionCookie.value) as LichessSession;
  } catch (e) {
    console.error('Error accessing session cookie:', e);
    return null;
  }
}

/**
 * Checks if the user is authenticated
 * 
 * @returns Promise that resolves to true if authenticated, false otherwise
 */
export async function isAuthenticated(): Promise<boolean> {
  return await getSession() !== null;
}

/**
 * Fetches fresh user data from Lichess API
 * 
 * @returns Promise that resolves to user data or null if not authenticated
 */
export async function getLichessUserData(): Promise<LichessUser | null> {
  const session = await getSession();
  
  if (!session?.accessToken) {
    return null;
  }
  
  try {
    // Fetch fresh user data from Lichess API
    const response = await fetch('https://lichess.org/api/account', {
      headers: {
        'Authorization': `Bearer ${session.accessToken}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch user data: ${response.status}`);
    }
    
    return await response.json() as LichessUser;
  } catch (error) {
    console.error('Error fetching user data:', error);
    return null;
  }
}

/**
 * Fetches real-time user data, falling back to session data if needed
 * 
 * @returns Promise that resolves to user data or null if not authenticated
 */
export async function getRealTimeUserData() {
  // Get both the session data and fresh data
  const session = await getSession();
  const freshData = await getLichessUserData();
  
  // If we can't get fresh data, fall back to session data
  if (!freshData) {
    return session?.user || null;
  }
  
  // Return the fresh data in the expected format
  return {
    id: freshData.id,
    name: freshData.username,
    perfs: freshData.perfs,
    url: `https://lichess.org/@/${freshData.username}`,
    createdAt: freshData.createdAt,
    playTime: freshData.playTime,
    title: freshData.title,
    profile: freshData.profile
  };
}


