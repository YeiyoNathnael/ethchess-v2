# Games API

The Games API provides functions for creating, accessing, and managing chess games on Lichess. This includes creating challenges, accepting or declining them, fetching game data, and exporting games in PGN format.

## Game Creation

### `createGame(options)`

Creates an open challenge on Lichess that can be accepted by anyone.

**Authentication Required**: Yes (requires 'challenge:write' scope)

**Parameters:**
- `options`: Game creation options
    - `time`: Time in minutes for each player's clock
    - `increment`: Increment in seconds added after each move
    - `color`: (Optional) Which color the player will have ('white', 'black', or 'random')
    - `variant`: (Optional) Chess variant to play
    - `ratingRange`: (Optional) Rating range filter for opponents

**Returns:**
A Promise that resolves to the challenge data object or throws an error.

**Example:**
```typescript
import { createGame } from '@/lib/lichess/api';

// Create a 10+0 blitz game
try {
    const game = await createGame({
        time: 10,
        increment: 0,
        color: 'random'
    });
    
    console.log(`Game created! URL: ${game.url}`);
    console.log(`Game ID: ${game.gameId}`);
} catch (error) {
    console.error('Failed to create game:', error);
}
```

### `challengePlayer(username, options)`

Creates a challenge against a specific player on Lichess.

**Authentication Required**: Yes (requires 'challenge:write' scope)

**Parameters:**
- `username`: Username of the player to challenge
- `options`: Game creation options (same as `createGame`)

**Returns:**
A Promise that resolves to the challenge data object or throws an error.

**Example:**
```typescript
import { challengePlayer } from '@/lib/lichess/api';

// Challenge a player to a 15+10 rapid game
try {
    const challenge = await challengePlayer('opponent_username', {
        time: 15,
        increment: 10,
        color: 'white',
        variant: 'standard'
    });
    
    console.log(`Challenge sent! URL: ${challenge.url}`);
} catch (error) {
    console.error('Failed to send challenge:', error);
}
```

## Challenge Management

### `acceptChallenge(challengeId)`

Accepts an incoming challenge.

**Authentication Required**: Yes (requires 'challenge:write' scope)

**Parameters:**
- `challengeId`: ID of the challenge to accept

**Returns:**
A Promise that resolves to a boolean indicating success.

**Example:**
```typescript
import { acceptChallenge } from '@/lib/lichess/api';

// Accept a challenge
const success = await acceptChallenge('abcdef123456');
if (success) {
    console.log('Challenge accepted!');
} else {
    console.log('Failed to accept challenge');
}
```

### `declineChallenge(challengeId, reason?)`

Declines an incoming challenge.

**Authentication Required**: Yes (requires 'challenge:write' scope)

**Parameters:**
- `challengeId`: ID of the challenge to decline
- `reason`: (Optional) Reason for declining, defaults to 'generic'
    - Valid reasons: 'generic', 'later', 'tooFast', 'tooSlow', 'timeControl', 'rated', 'casual', 'standard', 'variant', 'noBot', 'onlyBot'

**Returns:**
A Promise that resolves to a boolean indicating success.

**Example:**
```typescript
import { declineChallenge } from '@/lib/lichess/api';

// Decline a challenge because you want to play later
const success = await declineChallenge('abcdef123456', 'later');
if (success) {
    console.log('Challenge declined');
} else {
    console.log('Failed to decline challenge');
}
```

## Game Access

### `fetchGameById(gameId)`

Fetches a specific game by its ID.

**Authentication Required**: Yes

**Parameters:**
- `gameId`: The Lichess game ID

**Returns:**
A Promise that resolves to the game data object or null on error.

**Example:**
```typescript
import { fetchGameById } from '@/lib/lichess/api';

// Fetch a game by ID
const game = await fetchGameById('abcdef123456');
if (game) {
    console.log(`White player: ${game.players.white.user.name}`);
    console.log(`Black player: ${game.players.black.user.name}`);
    console.log(`Result: ${game.status}`);
} else {
    console.log('Game not found or error occurred');
}
```

### `exportGamePgn(gameId)`

Exports a game in PGN (Portable Game Notation) format.

**Authentication Required**: No

**Parameters:**
- `gameId`: The Lichess game ID

**Returns:**
A Promise that resolves to the PGN string or null on error.

**Example:**
```typescript
import { exportGamePgn } from '@/lib/lichess/api';

// Export a game in PGN format
const pgn = await exportGamePgn('abcdef123456');
if (pgn) {
    console.log('PGN data:');
    console.log(pgn);
    
    // Use the PGN with a chess board component
    // <ChessBoard pgn={pgn} />
} else {
    console.log('Failed to export game');
}
```

## Types

### `CreateGameOptions`

Options for creating a game or challenge.
```typescript
interface CreateGameOptions {
    /** Time in minutes for each player's clock */
    time: number;
    /** Increment in seconds added after each move */
    increment: number;
    /** Which color the player will have */
    color?: 'white' | 'black' | 'random';
    /** Chess variant to play */
    variant?: LichessVariantKey;
    /** Rating range filter for opponents */
    ratingRange?: string;
}
```

### `LichessGame`

Represents a Lichess game. This type is imported from the library's types module and includes properties like:
- `id`: The game ID
- `players`: Object containing data about white and black players
- `status`: Game status (e.g., 'created', 'started', 'aborted', 'mate', 'resign', etc.)
- `moves`: The moves of the game in UCI format
- `clock`: Information about the game clock
- And many other properties

## Common Use Cases

### Creating a Custom Game with a Friend

```typescript
import { challengePlayer } from '@/lib/lichess/api';

async function challengeFriend(username) {
    try {
        // Create a 5+3 game with a custom variant
        const challenge = await challengePlayer(username, {
            time: 5,
            increment: 3,
            color: 'random',
            variant: 'crazyhouse'
        });
        
        // Redirect to the challenge page
        window.location.href = challenge.url;
    } catch (error) {
        console.error('Failed to challenge friend:', error);
        alert('Could not create challenge. Please try again later.');
    }
}
```

### Displaying a Chess Game

```typescript
import { fetchGameById, exportGamePgn } from '@/lib/lichess/api';
import { useState, useEffect } from 'react';

function GameViewer({ gameId }) {
    const [game, setGame] = useState(null);
    const [pgn, setPgn] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    useEffect(() => {
        async function loadGame() {
            try {
                setLoading(true);
                
                // Fetch game data and PGN in parallel
                const [gameData, pgnData] = await Promise.all([
                    fetchGameById(gameId),
                    exportGamePgn(gameId)
                ]);
                
                setGame(gameData);
                setPgn(pgnData);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        
        if (gameId) {
            loadGame();
        }
    }, [gameId]);
    
    if (loading) return <div>Loading game...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!game) return <div>Game not found</div>;
    
    return (
        <div className="game-viewer">
            <div className="game-header">
                <h2>{game.players.white.user?.name} vs {game.players.black.user?.name}</h2>
                <div className="game-info">
                    <span>Time control: {game.clock?.initial/60}+{game.clock?.increment}</span>
                    <span>Result: {game.status}</span>
                </div>
            </div>
            
            {pgn && <ChessBoard pgn={pgn} />}
        </div>
    );
}
```

### Open Challenge Flow (Create, wait, play)

```typescript
import { createGame } from '@/lib/lichess/api';
import { useState } from 'react';

function OpenChallenge() {
    const [creating, setCreating] = useState(false);
    const [challenge, setChallenge] = useState(null);
    const [error, setError] = useState(null);
    
    async function handleCreateChallenge() {
        try {
            setCreating(true);
            setError(null);
            
            const result = await createGame({
                time: 5,
                increment: 0,
                color: 'random'
            });
            
            setChallenge(result);
            
            // Poll for challenge status or use websockets
            checkChallengeStatus(result.gameId);
        } catch (err) {
            setError(err.message);
        } finally {
            setCreating(false);
        }
    }
    
    function checkChallengeStatus(gameId) {
        // Implementation would check if the challenge has been accepted
        // and redirect to the game page when it has
    }
    
    return (
        <div className="open-challenge">
            {!challenge ? (
                <>
                    <h2>Create Open Challenge</h2>
                    <button 
                        onClick={handleCreateChallenge} 
                        disabled={creating}
                    >
                        {creating ? 'Creating...' : 'Create 5+0 Blitz Challenge'}
                    </button>
                    {error && <div className="error">{error}</div>}
                </>
            ) : (
                <>
                    <h2>Challenge Created!</h2>
                    <p>Waiting for someone to accept your challenge...</p>
                    <div className="challenge-link">
                        <a href={challenge.url} target="_blank" rel="noopener noreferrer">
                            View Challenge on Lichess
                        </a>
                    </div>
                    <button onClick={() => setChallenge(null)}>Cancel</button>
                </>
            )}
        </div>
    );
}
```