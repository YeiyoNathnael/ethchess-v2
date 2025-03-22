/**
 * Lichess API integration
 * 
 * This module provides functions to interact with various Lichess API endpoints
 */

// Re-export all API categories
export * from './account';
export * from './games';
export * from './tournaments';
export * from './puzzles';
export * from './status';
export * from './tv';
export * from './analysis';
export * from './teams';
export * from './relations';
export * from './explorer';
export * from './tablebase';
export * from './broadcasts';
export * from './fide';
export * from './studies';

// Common types for API requests
export interface RequestOptions {
  /**
   * Whether to include a cache-busting parameter
   * Useful for ensuring fresh data
   */
  noCache?: boolean;
}

/**
 * Builds full API URL with optional cache-busting
 */
export function buildApiUrl(
  path: string, 
  params: Record<string, string> = {}, 
  options: RequestOptions = {}
): string {
  // Create URL with base Lichess API
  const url = new URL(`https://lichess.org/api/${path}`);
  
  // Add all parameters
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.append(key, value);
    }
  });
  
  // Add cache-busting if requested
  if (options.noCache) {
    url.searchParams.append('_', Date.now().toString());
  }
  
  return url.toString();
}