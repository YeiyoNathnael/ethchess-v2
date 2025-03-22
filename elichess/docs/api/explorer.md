# Opening Explorer API

The Explorer API provides access to Lichess's opening databases, allowing you to search positions across master games, Lichess games, and player-specific games.

## Overview

The Explorer API operates on a separate domain (`explorer.lichess.ovh`) and offers several databases:

- **Masters Database**: Over-the-board games played by titled players
- **Lichess Database**: Online games played on Lichess
- **Player Database**: Games played by a specific player

## Functions

### `queryMastersDatabase(options)`

Queries the masters (OTB) database for a specific position or move sequence.

**Parameters:**
- `options`: Query parameters
    - `fen`: Current FEN position
    - `play`: Move sequence in UCI format (e.g., "e2e4,e7e5")
    - `since`: Only include games since this year
    - `until`: Only include games until this year
    - `moves`: Maximum number of moves to return
    - `ratings`: Only include games with player whose rating was at least this value

**Returns:**
A Promise that resolves to the explorer data or `null` on error.

**Example:**
```typescript
import { queryMastersDatabase } from '@/lib/lichess/api';

// Query the Sicilian Defense position
const result = await queryMastersDatabase({
    fen: 'rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2',
    since: 2000,
    moves: 10
});

if (result) {
    console.log(`Total games: ${result.total}`);
    console.log('Top moves:');
    result.moves.forEach(move => {
        console.log(`${move.san}: ${move.white + move.draws + move.black} games, ${move.winPercent}% win rate`);
    });
}
```

### `queryLichessDatabase(options)`

Queries the Lichess games database for a specific position or move sequence.

**Parameters:**
- `options`: Query parameters
    - `fen`: Current FEN position
    - `play`: Move sequence in UCI format
    - `variant`: Chess variant (default is 'standard')
    - `speeds`: Game speeds to include (comma-separated)
    - `ratings`: Rating ranges to include (comma-separated)
    - `since`: Only include games since this month (format: YYYY-MM)
    - `until`: Only include games until this month (format: YYYY-MM)
    - `moves`: Maximum number of moves to return
    - `recentGames`: Maximum number of recent games to return
    - `topGames`: Only include tournament games

**Returns:**
A Promise that resolves to the explorer data or `null` on error.

**Example:**
```typescript
import { queryLichessDatabase } from '@/lib/lichess/api';

// Query a position in blitz games from 1800-2200 rated players
const result = await queryLichessDatabase({
    fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3',
    speeds: 'blitz',
    ratings: '1800,2000,2200',
    since: '2020-01',
    moves: 5,
    recentGames: 3
});

if (result) {
    console.log(`Total Lichess games in this position: ${result.total}`);
    // Display most common moves
    result.moves.forEach(move => {
        console.log(`${move.san}: ${move.white + move.draws + move.black} games`);
    });
    
    // Show recent games
    if (result.recentGames) {
        console.log('Recent games:');
        result.recentGames.forEach(game => {
            console.log(`${game.white.name} vs ${game.black.name}: ${game.winner ? game.winner + ' won' : 'Draw'}`);
        });
    }
}
```

### `queryPlayerDatabase(options)`

Queries a specific player's games database for a position.

**Parameters:**
- `options`: Query parameters (required)
    - `player`: Username of the player to query (required)
    - `color`: Color the player was playing ('white' or 'black') (required)
    - `fen`: Current FEN position
    - `play`: Move sequence in UCI format
    - `recentGames`: Maximum number of recent games to return
    - `moves`: Maximum number of moves to return

**Returns:**
A Promise that resolves to the explorer data or `null` on error.

**Example:**
```typescript
import { queryPlayerDatabase } from '@/lib/lichess/api';

// Query Magnus Carlsen's white games in the Ruy Lopez
const result = await queryPlayerDatabase({
    player: 'DrNykterstein',  // Magnus Carlsen's Lichess username
    color: 'white',
    fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3',
    recentGames: 5
});

if (result) {
    console.log(`Total games by DrNykterstein in this position: ${result.total}`);
    
    // Display moves played by this player
    result.moves.forEach(move => {
        console.log(`${move.san}: ${move.white + move.draws + move.black} games, ${move.winPercent}% win rate`);
    });
    
    // Show recent games
    if (result.recentGames) {
        console.log('Recent games:');
        result.recentGames.forEach(game => {
            console.log(`vs ${game.black.name}: ${game.winner ? game.winner + ' won' : 'Draw'}`);
        });
    }
}
```

### `getMasterGamePgn(gameId)`

Gets the PGN of a specific master game by ID.

**Parameters:**
- `gameId`: ID of the master game

**Returns:**
A Promise that resolves to the PGN string or `null` on error.

**Example:**
```typescript
import { getMasterGamePgn } from '@/lib/lichess/api';

// Get PGN of a master game
const pgn = await getMasterGamePgn('12345');
if (pgn) {
    console.log('Master game PGN:');
    console.log(pgn);
    
    // Use the PGN with a chess board display component
    // <ChessBoard pgn={pgn} />
}
```

## Types

### `MastersOptions`

Options for masters database queries.

```typescript
interface MastersOptions {
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
```

### `LichessExplorerOptions`

Options for Lichess games database queries.

```typescript
interface LichessExplorerOptions {
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
```

### `PlayerExplorerOptions`

Options for player-specific database queries.

```typescript
interface PlayerExplorerOptions {
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
```

## Response Structure

All explorer endpoints return similar data structures with these key properties:

- `total`: Total number of games in the database for this position
- `white`: Number of games won by white
- `draws`: Number of drawn games
- `black`: Number of games won by black
- `moves`: Array of possible moves from this position
    - Each move contains statistics about that continuation
- `recentGames`: Array of recent games (if requested)
- `topGames`: Array of top games (if requested)

## Common Use Cases

### Opening Preparation

```typescript
import { queryMastersDatabase, queryPlayerDatabase } from '@/lib/lichess/api';

async function prepareOpening(opponentUsername, position) {
    // Check what masters play in this position
    const mastersData = await queryMastersDatabase({
        fen: position,
        since: 2015,
        moves: 5
    });
    
    // Check what your opponent plays
    const opponentGames = await queryPlayerDatabase({
        player: opponentUsername,
        color: 'black', // Assuming you're playing white
        fen: position,
        recentGames: 3
    });
    
    return {
        masterMoves: mastersData?.moves || [],
        opponentPreference: opponentGames?.moves || []
    };
}

// Use the function
const preparation = await prepareOpening('opponent', 
    'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2'
);

console.log('Master recommendations:');
preparation.masterMoves.forEach(move => {
    console.log(`${move.san}: ${move.winPercent}% win rate (${move.white + move.draws + move.black} games)`);
});

console.log('Opponent tends to play:');
preparation.opponentPreference.forEach(move => {
    console.log(`${move.san}: ${move.white + move.draws + move.black} times`);
});
```

### Comparing Opening Popularity at Different Rating Levels

```typescript
import { queryLichessDatabase } from '@/lib/lichess/api';

async function compareByRating(position) {
    // Beginner level
    const beginnerData = await queryLichessDatabase({
        fen: position,
        speeds: 'rapid,classical',
        ratings: '1600,1800'
    });
    
    // Advanced level
    const advancedData = await queryLichessDatabase({
        fen: position,
        speeds: 'rapid,classical',
        ratings: '2200,2500'
    });
    
    return {
        beginnerMoves: beginnerData?.moves || [],
        advancedMoves: advancedData?.moves || []
    };
}

// Example usage
const comparison = await compareByRating(
    'rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2' // Sicilian Defense
);

console.log('Popular among 1600-1800 players:');
comparison.beginnerMoves.slice(0, 3).forEach(move => {
    console.log(`${move.san}: ${Math.round((move.white + move.draws + move.black) / 
        (comparison.beginnerMoves.reduce((sum, m) => sum + m.white + m.draws + m.black, 0)) * 100)}%`);
});

console.log('Popular among 2200-2500 players:');
comparison.advancedMoves.slice(0, 3).forEach(move => {
    console.log(`${move.san}: ${Math.round((move.white + move.draws + move.black) / 
        (comparison.advancedMoves.reduce((sum, m) => sum + m.white + m.draws + m.black, 0)) * 100)}%`);
});
```
