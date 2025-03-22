import { buildApiUrl, RequestOptions } from './index';

/**
 * Get cloud evaluation for a position
 * 
 * @param fen - FEN string of the position
 * @param multiPv - Number of principal variations (1-5)
 * @param variant - Variant of the game
 */
export async function getCloudEval(
  fen: string, 
  multiPv: number = 1, 
  variant: string = 'standard'
): Promise<any> {
  const params: Record<string, string> = {
    fen,
    multiPv: Math.min(Math.max(multiPv, 1), 5).toString(),
    variant
  };
  
  try {
    const response = await fetch(buildApiUrl('cloud-eval', params));
    
    if (!response.ok) {
      if (response.status === 404) {
        return null; // Position not found in cloud
      }
      throw new Error(`Lichess API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching cloud eval:', error);
    return null;
  }
}

/**
 * Fetch tablebase information (remote endpoint)
 * 
 * @param fen - FEN string of the position
 */
export async function getTablebase(fen: string): Promise<any> {
  try {
    const response = await fetch(`https://tablebase.lichess.ovh/standard?fen=${encodeURIComponent(fen)}`);
    
    if (!response.ok) {
      throw new Error(`Tablebase API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching tablebase:', error);
    return null;
  }
}