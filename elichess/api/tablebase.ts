/**
 * Lichess Tablebase API
 * These endpoints are on tablebase.lichess.ovh domain, not lichess.org
 */

/**
 * Lookup a standard chess position in the tablebase
 * 
 * @param fen - FEN string of the position to lookup
 * @returns Tablebase result or null on error
 */
export async function queryTablebase(fen: string) {
    try {
      const url = `https://tablebase.lichess.ovh/standard?fen=${encodeURIComponent(fen)}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Tablebase API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error querying tablebase:', error);
      return null;
    }
  }
  
  /**
   * Lookup an atomic chess position in the tablebase
   * 
   * @param fen - FEN string of the position to lookup
   * @returns Tablebase result or null on error
   */
  export async function queryAtomicTablebase(fen: string) {
    try {
      const url = `https://tablebase.lichess.ovh/atomic?fen=${encodeURIComponent(fen)}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Tablebase API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error querying atomic tablebase:', error);
      return null;
    }
  }
  
  /**
   * Lookup an antichess position in the tablebase
   * 
   * @param fen - FEN string of the position to lookup
   * @returns Tablebase result or null on error
   */
  export async function queryAntichessTablebase(fen: string) {
    try {
      const url = `https://tablebase.lichess.ovh/antichess?fen=${encodeURIComponent(fen)}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Tablebase API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error querying antichess tablebase:', error);
      return null;
    }
  }