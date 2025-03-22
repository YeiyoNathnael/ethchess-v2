# TV API

The TV API provides functions for accessing Lichess TV, which showcases the best ongoing games in various categories. This API allows you to fetch current TV games, stream game updates, and get games from specific channels.

## Overview

Lichess TV highlights interesting games being played right now across different time controls and rating ranges. The TV API enables:

- Viewing the current featured games across all TV channels
- Streaming live updates from the main TV or specific channels
- Fetching the best ongoing games in a particular category

## Functions

### `getTvChannels(options?)`

Gets the current featured games for all TV channels.

**Authentication Required**: No

**Parameters:**
- `options`: (Optional) Request options
    - `noCache`: Set to `true` to bypass cache

**Returns:**
A Promise that resolves to an object containing TV channel data or `null` on error.

**Example:**
```typescript
import { getTvChannels } from '@/lib/lichess/api';

// Get current TV games across all channels
const channels = await getTvChannels();

if (channels) {
    console.log('Current TV channels:');
    Object.entries(channels).forEach(([channel, game]) => {
        console.log(`${channel}: ${game.white.name} (${game.white.rating}) vs ${game.black.name} (${game.black.rating})`);
    });
    
    // Access a specific channel
    const blitzGame = channels.blitz;
    if (blitzGame) {
        console.log(`Featured Blitz: ${blitzGame.white.name} vs ${blitzGame.black.name}`);
        console.log(`Status: ${blitzGame.status}`);
    }
}
```

### `streamTvFeed()`

Streams live updates from the current main TV game.

**Authentication Required**: No

**Returns:**
A Promise that resolves to a ReadableStream of game updates or `null` on error.

**Example:**
```typescript
import { streamTvFeed } from '@/lib/lichess/api';
import { createNdjsonParser } from '@/lib/utils';

// Stream the main TV game
async function watchMainTv() {
    const stream = await streamTvFeed();
    
    if (!stream) {
        console.error('Failed to connect to TV stream');
        return;
    }
    
    // Parse the NDJSON stream
    const parser = createNdjsonParser();
    const reader = stream.getReader();
    
    try {
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            // Process each chunk
            const events = parser.push(new TextDecoder().decode(value));
            
            events.forEach(event => {
                if (event.t === 'move') {
                    console.log(`Move: ${event.d.san}`);
                    // Update UI with the new move
                } else if (event.t === 'clock') {
                    console.log(`Clock: White ${event.d.white}s, Black ${event.d.black}s`);
                    // Update clock display
                } else if (event.t === 'end') {
                    console.log(`Game ended: ${event.d.winner} wins`);
                    // Handle game end
                }
            });
        }
    } catch (error) {
        console.error('Error reading stream:', error);
    } finally {
        reader.releaseLock();
    }
}
```

### `streamTvChannelFeed(channel)`

Streams live updates from a specific TV channel.

**Authentication Required**: No

**Parameters:**
- `channel`: The channel to stream (e.g., 'blitz', 'rapid', 'classical')

**Returns:**
A Promise that resolves to a ReadableStream of game updates or `null` on error.

**Example:**
```typescript
import { streamTvChannelFeed } from '@/lib/lichess/api';
import { createNdjsonParser } from '@/lib/utils';

// Stream the rapid TV channel
async function watchRapidTv() {
    const stream = await streamTvChannelFeed('rapid');
    
    if (!stream) {
        console.error('Failed to connect to rapid TV stream');
        return;
    }
    
    // Parse the NDJSON stream (similar to streamTvFeed example)
    const parser = createNdjsonParser();
    const reader = stream.getReader();
    
    try {
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            const events = parser.push(new TextDecoder().decode(value));
            
            events.forEach(event => {
                // Process events as in streamTvFeed example
                console.log('Event:', event.t, event.d);
            });
        }
    } catch (error) {
        console.error('Error reading stream:', error);
    } finally {
        reader.releaseLock();
    }
}
```

### `getTvChannelGames(channel, nb?, moves?)`

Gets the best ongoing games for a specific TV channel.

**Authentication Required**: No

**Parameters:**
- `channel`: The channel to get games for (e.g., 'blitz', 'rapid', 'classical')
- `nb`: (Optional) Number of games to fetch, defaults to 10
- `moves`: (Optional) Whether to include moves, defaults to true

**Returns:**
A Promise that resolves to an object containing games data or `null` on error.

**Example:**
```typescript
import { getTvChannelGames } from '@/lib/lichess/api';

// Get top 5 ongoing blitz games with moves
const blitzGames = await getTvChannelGames('blitz', 5, true);

if (blitzGames) {
    console.log(`Found ${blitzGames.length} blitz games`);
    
    blitzGames.forEach((game, index) => {
        console.log(`Game ${index + 1}: ${game.white.name} vs ${game.black.name}`);
        console.log(`Time control: ${game.clock.initial / 60}+${game.clock.increment}`);
        
        if (game.moves) {
            console.log(`Moves so far: ${game.moves}`);
        }
    });
}
```

## Available Channels

Lichess TV offers several channels, each featuring games of a specific category:

- `main`: Featured game (usually high-rated)
- `blitz`: Fast-paced games (3+2, 5+0, etc.)
- `rapid`: Moderate-paced games (10+0, 15+10, etc.)
- `classical`: Slow-paced games (30+0 and longer)
- `bullet`: Very fast games (1+0, 1+1, etc.)
- `computer`: Games against computer opponents
- `bot`: Games between bots
- `ultraBullet`: Ultra-fast games (15 seconds total)
- `topRated`: Games between top-rated players
- `champion`: Games featuring titled players

## Response Data Structures

### TV Channels Response

The TV channels response from `getTvChannels` typically includes:
```typescript
interface TvChannelsResponse {
    [channel: string]: {
        id: string;
        white: {
            id: string;
            name: string;
            rating: number;
            title?: string;
        };
        black: {
            id: string;
            name: string;
            rating: number;
            title?: string;
        };
        status: string;
        speed: string;
        perf: string;
        moves?: string; // UCI format
        fen: string;
        lastMove?: string;
        clock?: {
            white: number;
            black: number;
        };
    };
}
```

### TV Stream Events

The TV stream events from `streamTvFeed` and `streamTvChannelFeed` include:
```typescript
interface TvStreamEvent {
    t: string; // Event type: 'move', 'clock', 'end', etc.
    d: {
        // For 'move' events
        fen?: string;
        lm?: string; // Last move in UCI format
        san?: string; // Last move in SAN format
        
        // For 'clock' events
        white?: number; // White's remaining time in seconds
        black?: number; // Black's remaining time in seconds
        
        // For 'end' events
        winner?: 'white' | 'black' | null;
        status?: string; // Game status
    };
}
```
### Common Use Cases
#### TV Viewer Component
```typescript
import { getTvChannels, streamTvFeed } from '@/lib/lichess/api';
import { useState, useEffect, useRef } from 'react';
import { createNdjsonParser } from '@/lib/utils';

function LichessTvViewer() {
  const [channels, setChannels] = useState({});
  const [selectedChannel, setSelectedChannel] = useState('main');
  const [currentGame, setCurrentGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Reference to store the stream reader
  const streamReaderRef = useRef(null);
  
  // Load available TV channels
  useEffect(() => {
    async function loadChannels() {
      try {
        setLoading(true);
        setError(null);
        
        const channelsData = await getTvChannels();
        
        if (channelsData) {
          setChannels(channelsData);
          
          // Set the current game to the selected channel
          setCurrentGame(channelsData[selectedChannel] || null);
        } else {
          setError(new Error('Failed to load TV channels'));
        }
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }
    
    loadChannels();
  }, []);
  
  // Stream the current game when selected channel changes
  useEffect(() => {
    // Clean up previous stream if any
    if (streamReaderRef.current) {
      streamReaderRef.current.cancel('Channel changed');
      streamReaderRef.current = null;
    }
    
    if (!channels[selectedChannel]) return;
    
    // Set initial game state
    setCurrentGame(channels[selectedChannel]);
    
    // Start streaming
    const streamGameUpdates = async () => {
      const stream = await streamTvFeed();
      
      if (!stream) {
        setError(new Error('Failed to connect to game stream'));
        return;
      }
      
      const parser = createNdjsonParser();
      const reader = stream.getReader();
      streamReaderRef.current = reader;
      
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const events = parser.push(new TextDecoder().decode(value));
          
          // Process events and update game state
          events.forEach(event => {
            if (event.t === 'move') {
              setCurrentGame(game => ({
                ...game,
                fen: event.d.fen,
                lastMove: event.d.lm,
                // Add the move to the moves string if it exists
                moves: game.moves ? game.moves + ' ' + event.d.lm : event.d.lm
              }));
            } else if (event.t === 'clock') {
              setCurrentGame(game => ({
                ...game,
                clock: {
                  white: event.d.white,
                  black: event.d.black
                }
              }));
            } else if (event.t === 'end') {
              setCurrentGame(game => ({
                ...game,
                status: 'finished',
                winner: event.d.winner
              }));
            }
          });
        }
      } catch (error) {
        // Ignore aborted errors from channel changes
        if (error.name !== 'AbortError') {
          console.error('Error reading stream:', error);
          setError(error);
        }
      }
    };
    
    streamGameUpdates();
    
    // Clean up on unmount or channel change
    return () => {
      if (streamReaderRef.current) {
        streamReaderRef.current.cancel('Component unmounted or channel changed');
        streamReaderRef.current = null;
      }
    };
  }, [selectedChannel, channels]);
  
  if (loading && !currentGame) return <div>Loading Lichess TV...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!currentGame) return <div>No game available</div>;
  
  return (
    <div className="lichess-tv-viewer">
      <div className="channel-selector">
        <h3>Lichess TV Channels</h3>
        <div className="channels-list">
          {Object.keys(channels).map(channel => (
            <button
              key={channel}
              className={selectedChannel === channel ? 'selected' : ''}
              onClick={() => setSelectedChannel(channel)}
            >
              {channel.charAt(0).toUpperCase() + channel.slice(1)}
            </button>
          ))}
        </div>
      </div>
      
      <div className="game-display">
        <div className="game-header">
          <div className="player white">
            <span className="name">
              {currentGame.white.title && <span className="title">{currentGame.white.title}</span>}
              {currentGame.white.name}
            </span>
            <span className="rating">{currentGame.white.rating}</span>
          </div>
          
          <div className="vs">vs</div>
          
          <div className="player black">
            <span className="name">
              {currentGame.black.title && <span className="title">{currentGame.black.title}</span>}
              {currentGame.black.name}
            </span>
            <span className="rating">{currentGame.black.rating}</span>
          </div>
        </div>
        
        <div className="chess-board">
          {/* Use your preferred chess board component */}
          <ChessBoard 
            fen={currentGame.fen} 
            lastMove={currentGame.lastMove} 
          />
        </div>
        
        <div className="game-info">
          <div className="clock">
            <div className="white-clock">
              {formatClock(currentGame.clock?.white)}
            </div>
            <div className="black-clock">
              {formatClock(currentGame.clock?.black)}
            </div>
          </div>
          
          <a 
            href={`https://lichess.org/${currentGame.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="watch-on-lichess"
          >
            Watch on Lichess
          </a>
        </div>
      </div>
    </div>
  );
}

// Helper function to format clock time
function formatClock(seconds) {
  if (seconds === undefined) return '--:--';
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}
```
#### Multi-Game Viewer

```typescript
import { getTvChannelGames } from '@/lib/lichess/api';
import { useState, useEffect } from 'react';

function MultiGameViewer() {
  const [channel, setChannel] = useState('blitz');
  const [games, setGames] = useState([]);
  const [selectedGameIndex, setSelectedGameIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    async function loadGames() {
      try {
        setLoading(true);
        setError(null);
        
        const gamesData = await getTvChannelGames(channel, 8, true);
        
        if (gamesData) {
          setGames(gamesData);
          setSelectedGameIndex(0);
        } else {
          setError(new Error(`Failed to load ${channel} games`));
        }
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }
    
    loadGames();
    
    // Refresh games every 30 seconds
    const intervalId = setInterval(loadGames, 30000);
    
    return () => clearInterval(intervalId);
  }, [channel]);
  
  const handleChannelChange = (newChannel) => {
    setChannel(newChannel);
    setGames([]);
    setSelectedGameIndex(0);
  };
  
  if (loading && games.length === 0) return <div>Loading games...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (games.length === 0) return <div>No games available</div>;
  
  const selectedGame = games[selectedGameIndex];
  
  return (
    <div className="multi-game-viewer">
      <div className="channel-selector">
        <button 
          className={channel === 'bullet' ? 'active' : ''} 
          onClick={() => handleChannelChange('bullet')}
        >
          Bullet
        </button>
        <button 
          className={channel === 'blitz' ? 'active' : ''} 
          onClick={() => handleChannelChange('blitz')}
        >
          Blitz
        </button>
        <button 
          className={channel === 'rapid' ? 'active' : ''} 
          onClick={() => handleChannelChange('rapid')}
        >
          Rapid
        </button>
        <button 
          className={channel === 'classical' ? 'active' : ''} 
          onClick={() => handleChannelChange('classical')}
        >
          Classical
        </button>
      </div>
      
      <div className="game-display">
        <div className="selected-game">
          <div className="game-header">
            <div className="player white">
              <span className="name">
                {selectedGame.white.title && <span className="title">{selectedGame.white.title}</span>}
                {selectedGame.white.name}
              </span>
              <span className="rating">{selectedGame.white.rating}</span>
            </div>
            
            <div className="vs">vs</div>
            
            <div className="player black">
              <span className="name">
                {selectedGame.black.title && <span className="title">{selectedGame.black.title}</span>}
                {selectedGame.black.name}
              </span>
              <span className="rating">{selectedGame.black.rating}</span>
            </div>
          </div>
          
          <div className="chess-board">
            <ChessBoard 
              fen={selectedGame.fen} 
              lastMove={selectedGame.lastMove}
              moves={selectedGame.moves}
            />
          </div>
          
          <a 
            href={`https://lichess.org/${selectedGame.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="watch-on-lichess"
          >
            Watch on Lichess
          </a>
        </div>
        
        <div className="games-list">
          <h3>Current {channel.charAt(0).toUpperCase() + channel.slice(1)} Games</h3>
          
          <div className="game-thumbnails">
            {games.map((game, index) => (
              <div 
                key={game.id} 
                className={`game-thumbnail ${selectedGameIndex === index ? 'selected' : ''}`}
                onClick={() => setSelectedGameIndex(index)}
              >
                <div className="mini-board">
                  <ChessBoardThumbnail fen={game.fen} />
                </div>
                
                <div className="mini-info">
                  <div className="players">
                    <span>{game.white.name.substring(0, 10)}</span>
                    <span>vs</span>
                    <span>{game.black.name.substring(0, 10)}</span>
                  </div>
                  <div className="ratings">
                    {game.white.rating} / {game.black.rating}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
```