"use client"
import { LichessSession } from '../types';

/**
 * Check if user is authenticated (client-side)
 */
export async function is_Authenticated(): Promise<boolean> {
  try {
    const response = await fetch('/api/auth/lichess/status');
    if (!response.ok) return false;
    const data = await response.json();
    return !!data.isAuthenticated;
  } catch (error) {
    console.error('Auth check failed:', error);
    return false;
  }
}

/**
 * Get session data (client-side)
 */
export async function getSession(): Promise<LichessSession | null> {
  try {
    const response = await fetch('/api/auth/lichess/session');
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error('Session fetch failed:', error);
    return null;
  }
}

/**
 * Redirect to login page
 */
export function loginWithLichess(): void {
  window.location.href = '/api/auth/lichess/login';
}

/**
 * Logout user
 */
export async function logout(): Promise<void> {
  try {
    await fetch('/api/auth/lichess/logout', {
      method: 'POST',
      credentials: 'same-origin'
    });
  } catch (error) {
    console.error('Logout failed:', error);
  }
}