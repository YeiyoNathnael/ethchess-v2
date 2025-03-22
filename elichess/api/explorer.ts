/**
 * Lichess Opening Explorer API
 * These endpoints are on explorer.lichess.ovh domain, not lichess.org
 */

/**
 * Options for masters database query
 */
export interface MastersOptions {
    /** Current FEN position */
    fen?: string;
    /** Move sequence in UCI format (e.g. "e2e4,e7e5") */
    play?: string;
    /** Only include games since this year */
    since?: number;
    /** Only include games until this year */
    until?: number;
    /** Maximum number of moves to return */
    moves?: number;
    /** Only include games with player whose rating was at least this value */
    ratings?: number;
  }
  
  /**
   * Query the masters (OTB) database for a position
   * 
   * @param options - Query options
   * @returns Opening explorer data or null on error
   */
  export async function queryMastersDatabase(options: MastersOptions = {}) {
    try {
      const params: Record<string, string> = {};
      
      if (options.fen) params.fen = options.fen;
      if (options.play) params.play = options.play;
      if (options.since) params.since = options.since.toString();
      if (options.until) params.until = options.until.toString();
      if (options.moves) params.moves = options.moves.toString();
      if (options.ratings) params.ratings = options.ratings.toString();
      
      // Convert params to query string
      const queryString = Object.entries(params)
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
        .join('&');
      
      const url = `https://explorer.lichess.ovh/masters${queryString ? `?${queryString}` : ''}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Explorer API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error querying masters database:', error);
      return null;
    }
  }
  
  /**
   * Options for Lichess games database query
   */
  export interface LichessExplorerOptions {
    /** Current FEN position */
    fen?: string;
    /** Move sequence in UCI format (e.g. "e2e4,e7e5") */
    play?: string;
    /** Chess variant - default is 'standard' */
    variant?: 'standard' | 'chess960' | 'crazyhouse' | 'antichess' | 'atomic' | 'horde' | 'kingOfTheHill' | 'racingKings' | 'threeCheck';
    /** Game speeds to include, comma-separated */
    speeds?: string;
    /** Rating ranges to include, comma-separated */
    ratings?: string;
    /** Only include games since this month (format: YYYY-MM) */
    since?: string;
    /** Only include games until this month (format: YYYY-MM) */
    until?: string;
    /** Maximum number of moves to return */
    moves?: number;
    /** Maximum number of recent games to return */
    recentGames?: number;
    /** Only include tournament games */
    topGames?: number;
  }
  
  /**
   * Query the Lichess games database for a position
   * 
   * @param options - Query options
   * @returns Opening explorer data or null on error
   */
  export async function queryLichessDatabase(options: LichessExplorerOptions = {}) {
    try {
      const params: Record<string, string> = {};
      
      if (options.fen) params.fen = options.fen;
      if (options.play) params.play = options.play;
      if (options.variant) params.variant = options.variant;
      if (options.speeds) params.speeds = options.speeds;
      if (options.ratings) params.ratings = options.ratings;
      if (options.since) params.since = options.since;
      if (options.until) params.until = options.until;
      if (options.moves !== undefined) params.moves = options.moves.toString();
      if (options.recentGames !== undefined) params.recentGames = options.recentGames.toString();
      if (options.topGames !== undefined) params.topGames = options.topGames.toString();
      
      // Convert params to query string
      const queryString = Object.entries(params)
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
        .join('&');
      
      const url = `https://explorer.lichess.ovh/lichess${queryString ? `?${queryString}` : ''}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Explorer API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error querying Lichess database:', error);
      return null;
    }
  }
  
  /**
   * Options for player database query
   */
  export interface PlayerExplorerOptions {
    /** Username of the player to query */
    player: string;
    /** Color the player was playing ('white' or 'black') */
    color: 'white' | 'black';
    /** Current FEN position */
    fen?: string;
    /** Move sequence in UCI format (e.g. "e2e4,e7e5") */
    play?: string;
    /** Maximum number of recent games to return */
    recentGames?: number;
    /** Maximum number of moves to return */
    moves?: number;
  }
  
  /**
   * Query a specific player's games database for a position
   * 
   * @param options - Query options
   * @returns Opening explorer data or null on error
   */
  export async function queryPlayerDatabase(options: PlayerExplorerOptions) {
    try {
      if (!options.player || !options.color) {
        throw new Error('Player and color are required');
      }
      
      const params: Record<string, string> = {
        player: options.player,
        color: options.color
      };
      
      if (options.fen) params.fen = options.fen;
      if (options.play) params.play = options.play;
      if (options.recentGames !== undefined) params.recentGames = options.recentGames.toString();
      if (options.moves !== undefined) params.moves = options.moves.toString();
      
      // Convert params to query string
      const queryString = Object.entries(params)
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
        .join('&');
      
      const url = `https://explorer.lichess.ovh/player?${queryString}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Explorer API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error querying player database:', error);
      return null;
    }
  }
  
  /**
   * Get PGN of a specific master game by ID
   * 
   * @param gameId - ID of the master game
   * @returns PGN string or null on error
   */
  export async function getMasterGamePgn(gameId: string) {
    try {
      const response = await fetch(`https://explorer.lichess.ovh/master/pgn/${gameId}`);
      
      if (!response.ok) {
        throw new Error(`Explorer API error: ${response.status}`);
      }
      
      return await response.text();
    } catch (error) {
      console.error(`Error fetching master game PGN for ${gameId}:`, error);
      return null;
    }
  }