# useGames Hooks

The `useGames` hooks provide React components with convenient interfaces for creating, managing, and viewing chess games on Lichess. These hooks simplify the process of creating challenges, handling incoming challenges, and fetching game data.

## Overview

The `useGames` module includes three primary hooks:

1. **`useCreateGame`** - For creating new games and challenges
2. **`useChallenges`** - For accepting or declining incoming challenges 
3. **`useGame`** - For fetching and displaying existing games

Each hook handles its own loading and error states, making it easy to provide feedback to users during asynchronous operations.

## useCreateGame

The `useCreateGame` hook provides functionality for creating open challenges or challenging specific players.

### Returns

- `challengeData`: Data returned from a successful challenge creation
- `loading`: Boolean indicating if a challenge is being created
- `error`: Error object if the creation failed, otherwise null
- `createOpenChallenge`: Function to create an open challenge
- `challengePlayer`: Function to challenge a specific player

### Usage

```jsx
import { useCreateGame } from '@/lib/lichess/hooks';

function CreateGameButton() {
    const { createOpenChallenge, loading, error } = useCreateGame();
    
    const handleCreateGame = async () => {
        try {
            // Create a 10+0 blitz game with random color
            const challenge = await createOpenChallenge({
                time: 10,
                increment: 0,
                color: 'random'
            });
            
            // Redirect to the challenge page
            window.location.href = challenge.url;
        } catch (err) {
            console.error('Failed to create game:', err);
        }
    };
    
    return (
        <div>
            <button 
                onClick={handleCreateGame} 
                disabled={loading}
            >
                {loading ? 'Creating...' : 'Play Now'}
            </button>
            {error && <p className="error">{error.message}</p>}
        </div>
    );
}
```

### Creating Open Challenges

The `createOpenChallenge` function creates a challenge that any player can accept.

#### Parameters:

- `options`: Challenge options
    - `time`: Clock initial time in minutes
    - `increment`: Clock increment in seconds
    - `color`: (Optional) Preferred color ('white', 'black', or 'random')
    - `variant`: (Optional) Chess variant
    - `ratingRange`: (Optional) Acceptable rating range for opponents

#### Example:

```jsx
// Create a 5+3 game with rating range 1600-1800
const challenge = await createOpenChallenge({
    time: 5,
    increment: 3,
    variant: 'standard',
    ratingRange: '1600-1800'
});
```

### Challenging Specific Players

The `challengePlayer` function sends a direct challenge to a specific player.

#### Parameters:

- `username`: Username of the player to challenge
- `options`: Challenge options
    - `time`: Clock initial time in minutes
    - `increment`: Clock increment in seconds
    - `color`: (Optional) Preferred color
    - `variant`: (Optional) Chess variant

#### Example:

```jsx
// Challenge Magnus to a 3+2 blitz game
try {
    const challenge = await challengePlayer('MagnusCarlsen', {
        time: 3,
        increment: 2,
        color: 'black',
        variant: 'standard'
    });
    console.log('Challenge sent:', challenge.url);
} catch (error) {
    console.error('Failed to send challenge:', error);
}
```

## useChallenges

The `useChallenges` hook provides functions for responding to incoming challenges.

### Returns

- `loading`: Boolean indicating if an action is in progress
- `error`: Error object if an action failed, otherwise null
- `acceptChallenge`: Function to accept a challenge
- `declineChallenge`: Function to decline a challenge

### Usage

```jsx
import { useChallenges } from '@/lib/lichess/hooks';

function ChallengeActions({ challengeId }) {
    const { acceptChallenge, declineChallenge, loading } = useChallenges();
    
    const handleAccept = async () => {
        const success = await acceptChallenge(challengeId);
        if (success) {
            // Redirect to game or update UI
        }
    };
    
    const handleDecline = async () => {
        await declineChallenge(challengeId, 'timeControl');
    };
    
    return (
        <div className="challenge-actions">
            <button 
                onClick={handleAccept} 
                disabled={loading}
            >
                Accept
            </button>
            <button 
                onClick={handleDecline} 
                disabled={loading}
            >
                Decline
            </button>
        </div>
    );
}
```

### Accepting Challenges

The `acceptChallenge` function accepts an incoming challenge.

#### Parameters:

- `challengeId`: ID of the challenge to accept

#### Returns: 

A Promise that resolves to a boolean indicating success or failure.

### Declining Challenges

The `declineChallenge` function declines an incoming challenge.

#### Parameters:

- `challengeId`: ID of the challenge to decline
- `reason`: (Optional) Reason for declining the challenge

#### Available decline reasons:

- `generic`: No specific reason
- `later`: Want to play later
- `tooFast`, `tooSlow`, `timeControl`: Issues with the time control
- `rated`, `casual`: Game mode preference
- `standard`, `variant`: Game type preference
- `noBot`, `onlyBot`: Opponent type preference

## useGame

The `useGame` hook fetches and provides data for a specific game.

### Parameters

- `gameId`: ID of the game to fetch (string, null, or undefined)

### Returns

- `game`: Game data object, or null if not loaded
- `pgn`: PGN notation of the game, or null if not loaded
- `loading`: Boolean indicating if the game is being fetched
- `error`: Error object if the fetch failed, otherwise null
- `refresh`: Function to manually refresh the game data

### Usage

```jsx
import { useGame } from '@/lib/lichess/hooks';

function GameViewer({ gameId }) {
    const { game, pgn, loading, error } = useGame(gameId);
    
    if (loading) return <div>Loading game...</div>;
    if (error) return <div>Error: {error.message}</div>;
    if (!game && !pgn) return <div>Game not found</div>;
    
    return (
        <div className="game-viewer">
            {/* Use game or pgn data to render a chess board */}
            <div className="game-info">
                {game && (
                    <>
                        <div className="players">
                            <div className="white">{game.players.white.user.name}</div>
                            <div className="black">{game.players.black.user.name}</div>
                        </div>
                        <div className="result">{game.status}</div>
                    </>
                )}
            </div>
            
            {pgn && (
                <div className="pgn-viewer">
                    {/* Render PGN or use it with a PGN viewer component */}
                </div>
            )}
        </div>
    );
}
```

## Common Use Cases

### Game Creation Form

A form that allows users to configure and create a custom game:

```jsx
import { useCreateGame } from '@/lib/lichess/hooks';

function GameCreationForm() {
    const { createOpenChallenge, loading } = useCreateGame();
    const [options, setOptions] = useState({
        time: 10,
        increment: 0,
        color: 'random',
        variant: 'standard'
    });
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const challenge = await createOpenChallenge(options);
            window.location.href = challenge.url;
        } catch (error) {
            console.error(error);
        }
    };
    
    // Form with inputs for options...
}
```

### Handling Challenges Notifications

Displaying and handling incoming challenges:

```jsx
import { useChallenges } from '@/lib/lichess/hooks';

function ChallengeNotification({ challenge }) {
    const { acceptChallenge, declineChallenge } = useChallenges();
    
    // Handle accept/decline with status messages...
}
```

### Game Analysis

Analyzing a completed game:

```jsx
import { useGame } from '@/lib/lichess/hooks';

function GameAnalysis({ gameId }) {
    const { game, pgn } = useGame(gameId);
    
    // Leverage game data for analysis component...
}
```

## Important Considerations

- **Authentication**: Most game-related functions require authentication. The hooks check authentication status automatically.
- **Error Handling**: Always implement error handling when using these hooks, especially for user-triggered actions.
- **Loading States**: Use the provided loading states to display appropriate feedback during async operations.
- **Real-time Updates**: These hooks do not provide real-time updates for ongoing games. For that purpose, consider using the `streamGame` function from the API directly or implementing a WebSocket connection.
- **Game Data Format**: The game object follows the Lichess API format and includes comprehensive information about the game, players, and moves.