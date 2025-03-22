import { buildApiUrl, RequestOptions } from './index';

/**
 * Get current TV games for all channels
 */
export async function getTvChannels(options: RequestOptions = {}): Promise<any> {
  try {
    const response = await fetch(buildApiUrl('tv/channels', {}, options));
    
    if (!response.ok) {
      throw new Error(`Lichess API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching TV channels:', error);
    return null;
  }
}

/**
 * Stream the current TV game
 * 
 * @returns A string that can be parsed with ndjson
 */
export async function streamTvFeed(): Promise<ReadableStream<Uint8Array> | null> {
  try {
    const response = await fetch(buildApiUrl('tv/feed'));
    
    if (!response.ok) {
      throw new Error(`Lichess API error: ${response.status}`);
    }
    
    return response.body;
  } catch (error) {
    console.error('Error streaming TV feed:', error);
    return null;
  }
}

/**
 * Stream a specific TV channel
 * 
 * @param channel - The channel to stream (e.g., 'blitz', 'rapid', 'classical')
 * @returns A string that can be parsed with ndjson
 */
export async function streamTvChannelFeed(channel: string): Promise<ReadableStream<Uint8Array> | null> {
  try {
    const response = await fetch(buildApiUrl(`tv/${channel}/feed`));
    
    if (!response.ok) {
      throw new Error(`Lichess API error: ${response.status}`);
    }
    
    return response.body;
  } catch (error) {
    console.error(`Error streaming ${channel} TV feed:`, error);
    return null;
  }
}

/**
 * Get best ongoing games for a TV channel
 * 
 * @param channel - The channel to get games for
 * @param nb - Number of games to fetch
 * @param moves - Whether to include moves
 */
export async function getTvChannelGames(
  channel: string, 
  nb: number = 10, 
  moves: boolean = true
): Promise<any> {
  const params: Record<string, string> = {
    nb: nb.toString(),
    moves: moves.toString()
  };
  
  try {
    const response = await fetch(buildApiUrl(`tv/${channel}`, params), {
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Lichess API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching ${channel} TV games:`, error);
    return null;
  }
}