# useExplorer Hooks

The Lichess Explorer hooks provide a convenient way to access Lichess's opening explorer databases from React components. These hooks allow you to query master games, Lichess games, and player-specific opening repertoires directly from your UI.

## Overview

Opening explorer databases contain millions of chess games and positions, allowing you to study different opening lines, their popularity, and success rates. The Lichess explorer hooks make it easy to:

- Query the masters database (games played by titled players in OTB tournaments)
- Search the Lichess database (online games played on Lichess)
- Analyze a specific player's opening repertoire
- Fetch PGN for specific master games

## Available Hooks

### `useMastersExplorer`

Hook for accessing the masters database containing games played by chess masters in official tournaments.

**Returns:**
- `data`: Result of the last query
- `loading`: Boolean indicating if a query is in progress
- `error`: Error object if the query failed, otherwise null
- `query`: Function to query the masters database
- `getPgn`: Function to fetch the PGN of a specific master game

**Example:**
```jsx
import { useMastersExplorer } from '@/lib/lichess/hooks';
import { useState, useEffect } from 'react';

function MastersOpeningExplorer() {
    const { data, loading, error, query, getPgn } = useMastersExplorer();
    const [fen, setFen] = useState('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
    const [selectedGame, setSelectedGame] = useState(null);
    const [gameText, setGameText] = useState('');
    
    // Query the database when FEN changes
    useEffect(() => {
        if (fen) {
            query({ fen, recentGames: 5 });
        }
    }, [fen, query]);
    
    // Fetch PGN when a game is selected
    const handleGameClick = async (gameId) => {
        const pgn = await getPgn(gameId);
        setSelectedGame(gameId);
        setGameText(pgn || 'Failed to load game');
    };
    
    return (
        <div className="masters-explorer">
            <h2>Masters Database Explorer</h2>
            
            <input 
                type="text" 
                value={fen} 
                onChange={(e) => setFen(e.target.value)} 
                placeholder="Enter FEN"
            />
            
            {loading && <div>Loading...</div>}
            {error && <div className="error">Error: {error.message}</div>}
            
            {data && (
                <div className="explorer-results">
                    <div className="position-stats">
                        <h3>Position Statistics</h3>
                        <p>Total Games: {data.white + data.draws + data.black}</p>
                        <div className="win-bar">
                            <div 
                                className="white-wins" 
                                style={{ width: `${(data.white / (data.white + data.draws + data.black)) * 100}%` }}
                            >
                                White: {data.white}
                            </div>
                            <div 
                                className="draws" 
                                style={{ width: `${(data.draws / (data.white + data.draws + data.black)) * 100}%` }}
                            >
                                Draws: {data.draws}
                            </div>
                            <div 
                                className="black-wins" 
                                style={{ width: `${(data.black / (data.white + data.draws + data.black)) * 100}%` }}
                            >
                                Black: {data.black}
                            </div>
                        </div>
                    </div>
                    
                    <div className="moves-list">
                        <h3>Common Moves</h3>
                        <ul>
                            {data.moves.map(move => (
                                <li key={move.uci} onClick={() => handleMoveClick(move.uci)}>
                                    {move.san} - {move.white + move.draws + move.black} games 
                                    ({Math.round((move.white + move.draws * 0.5) / (move.white + move.draws + move.black) * 100)}%)
                                </li>
                            ))}
                        </ul>
                    </div>
                    
                    <div className="recent-games">
                        <h3>Recent Top Games</h3>
                        <ul>
                            {data.recentGames?.map(game => (
                                <li 
                                    key={game.id} 
                                    onClick={() => handleGameClick(game.id)}
                                    className={selectedGame === game.id ? 'selected' : ''}
                                >
                                    {game.white.name} ({game.white.rating}) vs {game.black.name} ({game.black.rating})
                                    <br />
                                    {game.tournament} ({game.year})
                                    <br />
                                    Result: {game.winner === 'white' ? '1-0' : game.winner === 'black' ? '0-1' : '½-½'}
                                </li>
                            ))}
                        </ul>
                    </div>
                    
                    {gameText && (
                        <div className="game-pgn">
                            <h3>Game PGN</h3>
                            <pre>{gameText}</pre>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
```

### `useLichessExplorer`

Hook for accessing the Lichess database containing millions of games played on Lichess.

**Returns:**
- `data`: Result of the last query
- `loading`: Boolean indicating if a query is in progress
- `error`: Error object if the query failed, otherwise null
- `query`: Function to query the Lichess database

**Example:**
```jsx
import { useLichessExplorer } from '@/lib/lichess/hooks';
import { useState, useEffect } from 'react';

function LichessOpeningExplorer() {
    const { data, loading, error, query } = useLichessExplorer();
    const [fen, setFen] = useState('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
    const [ratingRange, setRatingRange] = useState([1600, 1800]);
    const [speed, setSpeed] = useState('blitz');
    
    // Query the database when parameters change
    useEffect(() => {
        if (fen) {
            query({
                fen,
                speeds: [speed],
                ratings: [`${ratingRange[0]}-${ratingRange[1]}`],
                recentGames: 5
            });
        }
    }, [fen, ratingRange, speed, query]);
    
    return (
        <div className="lichess-explorer">
            <h2>Lichess Database Explorer</h2>
            
            <div className="controls">
                <input 
                    type="text" 
                    value={fen} 
                    onChange={(e) => setFen(e.target.value)} 
                    placeholder="Enter FEN"
                />
                
                <div className="rating-range">
                    <label>Rating Range:</label>
                    <select 
                        value={`${ratingRange[0]}-${ratingRange[1]}`} 
                        onChange={(e) => {
                            const [min, max] = e.target.value.split('-').map(Number);
                            setRatingRange([min, max]);
                        }}
                    >
                        <option value="0-1600">0-1600</option>
                        <option value="1600-1800">1600-1800</option>
                        <option value="1800-2000">1800-2000</option>
                        <option value="2000-2200">2000-2200</option>
                        <option value="2200-2500">2200-2500</option>
                        <option value="2500-3000">2500+</option>
                    </select>
                </div>
                
                <div className="speed-selector">
                    <label>Time Control:</label>
                    <select 
                        value={speed} 
                        onChange={(e) => setSpeed(e.target.value)}
                    >
                        <option value="ultraBullet">UltraBullet</option>
                        <option value="bullet">Bullet</option>
                        <option value="blitz">Blitz</option>
                        <option value="rapid">Rapid</option>
                        <option value="classical">Classical</option>
                        <option value="correspondence">Correspondence</option>
                    </select>
                </div>
            </div>
            
            {loading && <div>Loading...</div>}
            {error && <div className="error">Error: {error.message}</div>}
            
            {data && (
                <div className="explorer-results">
                    <div className="position-stats">
                        <h3>Position Statistics</h3>
                        <p>Total Games: {data.white + data.draws + data.black}</p>
                        <div className="win-bar">
                            <div 
                                className="white-wins" 
                                style={{ width: `${(data.white / (data.white + data.draws + data.black)) * 100}%` }}
                            >
                                White: {data.white} ({Math.round((data.white / (data.white + data.draws + data.black)) * 100)}%)
                            </div>
                            <div 
                                className="draws" 
                                style={{ width: `${(data.draws / (data.white + data.draws + data.black)) * 100}%` }}
                            >
                                Draws: {data.draws} ({Math.round((data.draws / (data.white + data.draws + data.black)) * 100)}%)
                            </div>
                            <div 
                                className="black-wins" 
                                style={{ width: `${(data.black / (data.white + data.draws + data.black)) * 100}%` }}
                            >
                                Black: {data.black} ({Math.round((data.black / (data.white + data.draws + data.black)) * 100)}%)
                            </div>
                        </div>
                    </div>
                    
                    <div className="moves-list">
                        <h3>Common Moves</h3>
                        <ul>
                            {data.moves.map(move => (
                                <li key={move.uci} onClick={() => handleMoveClick(move.uci)}>
                                    {move.san} - {move.white + move.draws + move.black} games 
                                    ({Math.round((move.white + move.draws * 0.5) / (move.white + move.draws + move.black) * 100)}%)
                                </li>
                            ))}
                        </ul>
                    </div>
                    
                    {data.recentGames?.length > 0 && (
                        <div className="recent-games">
                            <h3>Recent Games</h3>
                            <ul>
                                {data.recentGames.map(game => (
                                    <li key={game.id}>
                                        <a href={`https://lichess.org/${game.id}`} target="_blank" rel="noopener noreferrer">
                                            {game.white.name} ({game.white.rating}) vs {game.black.name} ({game.black.rating})
                                            <br />
                                            {game.speed} • {new Date(game.year).toLocaleDateString()}
                                            <br />
                                            Result: {game.winner === 'white' ? '1-0' : game.winner === 'black' ? '0-1' : '½-½'}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
```

### `usePlayerExplorer`

Hook for analyzing a specific player's opening repertoire.

**Returns:**
- `data`: Result of the last query
- `loading`: Boolean indicating if a query is in progress
- `error`: Error object if the query failed, otherwise null
- `query`: Function to query the player database

**Example:**
```jsx
import { usePlayerExplorer } from '@/lib/lichess/hooks';
import { useState, useEffect } from 'react';

function PlayerOpeningExplorer() {
    const { data, loading, error, query } = usePlayerExplorer();
    const [player, setPlayer] = useState('DrNykterstein');
    const [fen, setFen] = useState('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
    const [color, setColor] = useState('white');
    
    // Query the database when parameters change
    const handleSearch = () => {
        if (player && fen) {
            query({
                player,
                fen,
                color,
                recentGames: 10
            });
        }
    };
    
    return (
        <div className="player-explorer">
            <h2>Player Opening Explorer</h2>
            
            <div className="search-form">
                <div className="input-group">
                    <label>Player Username:</label>
                    <input 
                        type="text" 
                        value={player} 
                        onChange={(e) => setPlayer(e.target.value)} 
                        placeholder="Lichess username"
                    />
                </div>
                
                <div className="input-group">
                    <label>Position (FEN):</label>
                    <input 
                        type="text" 
                        value={fen} 
                        onChange={(e) => setFen(e.target.value)} 
                        placeholder="Enter FEN"
                    />
                </div>
                
                <div className="input-group">
                    <label>Playing as:</label>
                    <select 
                        value={color} 
                        onChange={(e) => setColor(e.target.value)}
                    >
                        <option value="white">White</option>
                        <option value="black">Black</option>
                        <option value="both">Both</option>
                    </select>
                </div>
                
                <button onClick={handleSearch} disabled={loading || !player || !fen}>
                    {loading ? 'Searching...' : 'Search'}
                </button>
            </div>
            
            {error && <div className="error">Error: {error.message}</div>}
            
            {data && (
                <div className="explorer-results">
                    <div className="player-stats">
                        <h3>{player}'s Statistics</h3>
                        <p>Games with this position: {data.white + data.draws + data.black}</p>
                        
                        {data.white + data.draws + data.black > 0 ? (
                            <>
                                <div className="win-bar">
                                    <div 
                                        className="white-wins" 
                                        style={{ width: `${(data.white / (data.white + data.draws + data.black)) * 100}%` }}
                                    >
                                        Wins: {data.white}
                                    </div>
                                    <div 
                                        className="draws" 
                                        style={{ width: `${(data.draws / (data.white + data.draws + data.black)) * 100}%` }}
                                    >
                                        Draws: {data.draws}
                                    </div>
                                    <div 
                                        className="black-wins" 
                                        style={{ width: `${(data.black / (data.white + data.draws + data.black)) * 100}%` }}
                                    >
                                        Losses: {data.black}
                                    </div>
                                </div>
                                <p>
                                    Performance: {Math.round((data.white + data.draws * 0.5) / (data.white + data.draws + data.black) * 100)}%
                                </p>
                            </>
                        ) : (
                            <p>No games found with this position.</p>
                        )}
                    </div>
                    
                    {data.moves?.length > 0 && (
                        <div className="moves-list">
                            <h3>{player}'s Move Choices</h3>
                            <ul>
                                {data.moves.map(move => (
                                    <li key={move.uci} onClick={() => handleMoveClick(move.uci)}>
                                        {move.san} - {move.white + move.draws + move.black} games 
                                        ({Math.round((move.white + move.draws * 0.5) / (move.white + move.draws + move.black) * 100)}%)
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    
                    {data.recentGames?.length > 0 && (
                        <div className="recent-games">
                            <h3>Recent Games</h3>
                            <ul>
                                {data.recentGames.map(game => (
                                    <li key={game.id}>
                                        <a href={`https://lichess.org/${game.id}`} target="_blank" rel="noopener noreferrer">
                                            {game.white.name} vs {game.black.name}
                                            <br />
                                            {game.year && new Date(game.year).toLocaleDateString()}
                                            <br />
                                            Result: {game.winner === 'white' ? '1-0' : game.winner === 'black' ? '0-1' : '½-½'}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
## Options Parameters

### MastersOptions

Options for querying the masters database:

```typescript
interface MastersOptions {
    /** Position in FEN notation */
    fen: string;
    /** Fetch up to this many recent games (max 15) */
    recentGames?: number;
    /** Moves to play before the position (array of UCI moves) */
    play?: string[];
    /** Only include games played since this year */
    since?: number;
    /** Only include games played before this year */
    until?: number;
    /** Whether to include top games */
    topGames?: boolean;
}
```

### LichessExplorerOptions

Options for querying the Lichess database:

```typescript
interface LichessExplorerOptions {
    /** Position in FEN notation */
    fen: string;
    /** Game speeds to include (e.g. ['bullet', 'blitz']) */
    speeds?: string[];
    /** Rating ranges (e.g. ['1600-1800', '1800-2000']) */
    ratings?: string[];
    /** Only include games with white variant success */
    variantWhite?: boolean;
    /** Only include games with black variant success */
    variantBlack?: boolean;
    /** Moves to play before the position (array of UCI moves) */
    play?: string[];
    /** Fetch up to this many recent games */
    recentGames?: number;
}
```

### PlayerExplorerOptions

Options for querying a player's database:

```typescript
interface PlayerExplorerOptions {
    /** Lichess username */
    player: string;
    /** Position in FEN notation */
    fen: string;
    /** Which color the player plays ('white', 'black', or 'both') */
    color: 'white' | 'black' | 'both';
    /** Game speeds to include (e.g. ['bullet', 'blitz']) */
    speeds?: string[];
    /** Moves to play before the position (array of UCI moves) */
    play?: string[];
    /** Fetch up to this many recent games */
    recentGames?: number;
}
```

## Integration with Chess Components

The explorer hooks are particularly useful when combined with chess board components. Here's an example integrating with a hypothetical `ChessBoard` component:

```typescript
import { useMastersExplorer } from '@/lib/lichess/hooks';
import { useState, useEffect } from 'react';
import ChessBoard from '@/components/ChessBoard';

function InteractiveExplorer() {
    const { data, loading, error, query } = useMastersExplorer();
    const [position, setPosition] = useState(new Chess());
    
    // Query the explorer when position changes
    useEffect(() => {
        if (position) {
            query({ fen: position.fen() });
        }
    }, [position, query]);
    
    // Handle move from the explorer
    const handleExplorerMove = (uci) => {
        const newPosition = new Chess(position.fen());
        newPosition.move({
            from: uci.substring(0, 2),
            to: uci.substring(2, 4),
            promotion: uci.length === 5 ? uci.substring(4, 5) : undefined
        });
        setPosition(newPosition);
    };
    
    // Handle move on the board
    const handleBoardMove = (move) => {
        const newPosition = new Chess(position.fen());
        newPosition.move(move);
        setPosition(newPosition);
    };
    
    return (
        <div className="interactive-explorer">
            <div className="board-container">
                <ChessBoard 
                    position={position.fen()} 
                    onMove={handleBoardMove} 
                />
            </div>
            
            <div className="explorer-panel">
                <h3>Opening Explorer</h3>
                
                {loading && <div>Loading...</div>}
                {error && <div className="error">Error: {error.message}</div>}
                
                {data && (
                    <div className="explorer-data">
                        <div className="stats">
                            <div className="progress-bar">
                                <div 
                                    className="white" 
                                    style={{ width: `${(data.white / (data.white + data.draws + data.black)) * 100}%` }}
                                >
                                    {data.white}
                                </div>
                                <div 
                                    className="draw" 
                                    style={{ width: `${(data.draws / (data.white + data.draws + data.black)) * 100}%` }}
                                >
                                    {data.draws}
                                </div>
                                <div 
                                    className="black" 
                                    style={{ width: `${(data.black / (data.white + data.draws + data.black)) * 100}%` }}
                                >
                                    {data.black}
                                </div>
                            </div>
                            <div className="total-games">
                                {data.white + data.draws + data.black} games
                            </div>
                        </div>
                        
                        <div className="moves">
                            {data.moves.map(move => (
                                <div 
                                    key={move.uci} 
                                    className="move-option"
                                    onClick={() => handleExplorerMove(move.uci)}
                                >
                                    <span className="san">{move.san}</span>
                                    <span className="games">{move.white + move.draws + move.black}</span>
                                    <div className="mini-bar">
                                        <div 
                                            className="white" 
                                            style={{ width: `${(move.white / (move.white + move.draws + move.black)) * 100}%` }}
                                        />
                                        <div 
                                            className="draw" 
                                            style={{ width: `${(move.draws / (move.white + move.draws + move.black)) * 100}%` }}
                                        />
                                        <div 
                                            className="black" 
                                            style={{ width: `${(move.black / (move.white + move.draws + move.black)) * 100}%` }}
                                        />
                                    </div>
                                    <span className="percentage">
                                        {Math.round((move.white + move.draws * 0.5) / (move.white + move.draws + move.black) * 100)}%
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
```
## Best Practices

- **Cache Results**: Consider caching explorer results to reduce API calls for positions that have already been explored.
- **Throttle Queries**: Avoid making too many rapid queries as the user explores the opening tree. Consider debouncing or throttling position changes.
- **Error Handling**: Always implement proper error handling to inform users when queries fail.
- **Loading States**: Show appropriate loading indicators during queries to provide feedback to users.
- **FEN Validation**: Validate FEN strings before querying to avoid unnecessary API calls with invalid positions.
- **Combine with Analysis**: Combine explorer data with engine analysis for a more comprehensive opening study tool.
- **Optimize for Mobile**: The explorer UI can become complex, so ensure it's responsive and works well on smaller screens.

### Advanced Example: Opening Preparation Tool
```typescript
import { 
  useMastersExplorer, 
  useLichessExplorer, 
  usePlayerExplorer 
} from '@/lib/lichess/hooks';
import { useState, useEffect } from 'react';
import ChessBoard from '@/components/ChessBoard';

function OpeningPreparationTool() {
  const masters = useMastersExplorer();
  const lichess = useLichessExplorer();
  const player = usePlayerExplorer();
  
  const [position, setPosition] = useState(new Chess());
  const [movesHistory, setMovesHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('masters');
  const [targetPlayer, setTargetPlayer] = useState('');
  const [playerColor, setPlayerColor] = useState('black');
  const [ratingRange, setRatingRange] = useState('1800-2000');
  
  // Query the selected database when position changes
  useEffect(() => {
    const fen = position.fen();
    
    if (activeTab === 'masters') {
      masters.query({ fen, recentGames: 5 });
    } else if (activeTab === 'lichess') {
      lichess.query({ 
        fen, 
        ratings: [ratingRange],
        recentGames: 5 
      });
    } else if (activeTab === 'player' && targetPlayer) {
      player.query({
        player: targetPlayer,
        fen,
        color: playerColor,
        recentGames: 5
      });
    }
  }, [position, activeTab, targetPlayer, playerColor, ratingRange]);
  
  // Handle move from the explorer
  const handleExplorerMove = (uci) => {
    const newPosition = new Chess(position.fen());
    const move = newPosition.move({
      from: uci.substring(0, 2),
      to: uci.substring(2, 4),
      promotion: uci.length === 5 ? uci.substring(4, 5) : undefined
    });
    
    if (move) {
      setPosition(newPosition);
      setMovesHistory([...movesHistory, move]);
    }
  };
  
  // Handle move on the board
  const handleBoardMove = (move) => {
    const newPosition = new Chess(position.fen());
    const result = newPosition.move(move);
    
    if (result) {
      setPosition(newPosition);
      setMovesHistory([...movesHistory, result]);
    }
  };
  
  // Go back one move
  const handleUndoMove = () => {
    if (movesHistory.length > 0) {
      const newPosition = new Chess();
      const newHistory = [...movesHistory];
      newHistory.pop();
      
      // Replay all moves except the last one
      newHistory.forEach(move => {
        newPosition.move(move);
      });
      
      setPosition(newPosition);
      setMovesHistory(newHistory);
    }
  };
  
  // Reset to initial position
  const handleReset = () => {
    setPosition(new Chess());
    setMovesHistory([]);
  };
  
  // Get the active database results
  const getActiveData = () => {
    if (activeTab === 'masters') return masters.data;
    if (activeTab === 'lichess') return lichess.data;
    if (activeTab === 'player') return player.data;
    return null;
  };
  
  // Get loading state
  const isLoading = () => {
    if (activeTab === 'masters') return masters.loading;
    if (activeTab === 'lichess') return lichess.loading;
    if (activeTab === 'player') return player.loading;
    return false;
  };
  
  // Get error state
  const getError = () => {
    if (activeTab === 'masters') return masters.error;
    if (activeTab === 'lichess') return lichess.error;
    if (activeTab === 'player') return player.error;
    return null;
  };
  
  const data = getActiveData();
  const loading = isLoading();
  const error = getError();
  
  return (
    <div className="opening-preparation-tool">
      <div className="board-section">
        <ChessBoard 
          position={position.fen()} 
          onMove={handleBoardMove} 
        />
        
        <div className="board-controls">
          <button onClick={handleUndoMove} disabled={movesHistory.length === 0}>
            Undo Move
          </button>
          <button onClick={handleReset}>
            Reset Position
          </button>
        </div>
        
        <div className="moves-history">
          <h3>Moves</h3>
          <div className="moves-list">
            {movesHistory.map((move, index) => (
              <span key={index} className="move">
                {index % 2 === 0 ? `${Math.floor(index/2) + 1}.` : ''} {move.san}
              </span>
            ))}
          </div>
        </div>
      </div>
      
      <div className="explorer-section">
        <div className="database-tabs">
          <button 
            className={activeTab === 'masters' ? 'active' : ''}
            onClick={() => setActiveTab('masters')}
          >
            Masters
          </button>
          <button 
            className={activeTab === 'lichess' ? 'active' : ''}
            onClick={() => setActiveTab('lichess')}
          >
            Lichess
          </button>
          <button 
            className={activeTab === 'player' ? 'active' : ''}
            onClick={() => setActiveTab('player')}
          >
            Player
          </button>
        </div>
        
        {activeTab === 'lichess' && (
          <div className="filter-options">
            <label>Rating Range:</label>
            <select 
              value={ratingRange} 
              onChange={(e) => setRatingRange(e.target.value)}
            >
              <option value="0-1600">0-1600</option>
              <option value="1600-1800">1600-1800</option>
              <option value="1800-2000">1800-2000</option>
              <option value="2000-2200">2000-2200</option>
              <option value="2200-2500">2200-2500</option>
              <option value="2500-3000">2500+</option>
            </select>
          </div>
        )}
        
        {activeTab === 'player' && (
          <div className="player-options">
            <input 
              type="text" 
              value={targetPlayer} 
              onChange={(e) => setTargetPlayer(e.target.value)} 
              placeholder="Lichess username"
            />
            
            <div className="color-selector">
              <label>
                <input 
                  type="radio" 
                  value="white" 
                  checked={playerColor === 'white'} 
                  onChange={() => setPlayerColor('white')} 
                />
                White
              </label>
              <label>
                <input 
                  type="radio" 
                  value="black" 
                  checked={playerColor === 'black'} 
                  onChange={() => setPlayerColor('black')} 
                />
                Black
              </label>
              <label>
                <input 
                  type="radio" 
                  value="both" 
                  checked={playerColor === 'both'} 
                  onChange={() => setPlayerColor('both')} 
                />
                Both
              </label>
            </div>
          </div>
        )}
        
        <div className="explorer-data">
          {loading && <div className="loading">Loading...</div>}
          {error && <div className="error">Error: {error.message}</div>}
          
          {data && !loading && (
            <>
              <div className="position-stats">
                <h3>Position Statistics</h3>
                <p>Total Games: {data.white + data.draws + data.black}</p>
                
                {data.white + data.draws + data.black > 0 ? (
                  <div className="progress-bar">
                    <div 
                      className="white" 
                      style={{ width: `${(data.white / (data.white + data.draws + data.black)) * 100}%` }}
                    >
                      {data.white} ({Math.round((data.white / (data.white + data.draws + data.black)) * 100)}%)
                    </div>
                    <div 
                      className="draw" 
                      style={{ width: `${(data.draws / (data.white + data.draws + data.black)) * 100}%` }}
                    >
                      {data.draws} ({Math.round((data.draws / (data.white + data.draws + data.black)) * 100)}%)
                    </div>
                    <div 
                      className="black" 
                      style={{ width: `${(data.black / (data.white + data.draws + data.black)) * 100}%` }}
                    >
                      {data.black} ({Math.round((data.black / (data.white + data.draws + data.black)) * 100)}%)
                    </div>
                  </div>
                ) : (
                  <p>No games found with this position.</p>
                )}
              </div>
              
              {data.moves?.length > 0 && (
                <div className="moves-options">
                  <h3>Available Moves</h3>
                  <table className="moves-table">
                    <thead>
                      <tr>
                        <th>Move</th>
                        <th>Games</th>
                        <th>Score</th>
                        <th>Avg Rating</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.moves.map(move => (
                        <tr 
                          key={move.uci} 
                          onClick={() => handleExplorerMove(move.uci)}
                          className="move-row"
                        >
                          <td className="move-san">{move.san}</td>
                          <td className="move-games">{move.white + move.draws + move.black}</td>
                          <td className="move-score">
                            {Math.round((move.white + move.draws * 0.5) / (move.white + move.draws + move.black) * 100)}%
                            <div className="mini-bar">
                              <div 
                                className="white" 
                                style={{ width: `${(move.white / (move.white + move.draws + move.black)) * 100}%` }}
                              />
                              <div 
                                className="draw" 
                                style={{ width: `${(move.draws / (move.white + move.draws + move.black)) * 100}%` }}
                              />
                              <div 
                                className="black" 
                                style={{ width: `${(move.black / (move.white + move.draws + move.black)) * 100}%` }}
                              />
                            </div>
                          </td>
                          <td className="move-avg-rating">{move.averageRating || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              
              {data.recentGames?.length > 0 && (
                <div className="recent-games">
                  <h3>Recent Games</h3>
                  <ul className="games-list">
                    {data.recentGames.map(game => (
                      <li key={game.id} className="game-item">
                        <div className="players">
                          <span className="white-player">{game.white.name}</span>
                          <span className="vs">vs</span>
                          <span className="black-player">{game.black.name}</span>
                        </div>
                        <div className="game-info">
                          <span className="result">
                            {game.winner === 'white' ? '1-0' : game.winner === 'black' ? '0-1' : '½-½'}
                          </span>
                          <span className="year">{game.year}</span>
                        </div>
                        <a 
                          href={`https://lichess.org/${game.id}`} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="view-game"
                        >
                          View
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
```