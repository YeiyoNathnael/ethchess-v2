# Broadcasts API

The Broadcasts API provides functions for working with Lichess broadcast tournaments and rounds. Broadcasts are used to relay chess games from external tournaments to Lichess.

## Overview

Lichess broadcasts consist of two main components:
- **Broadcast Tournaments**: The overall events (e.g., "World Chess Championship 2023")
- **Broadcast Rounds**: Individual sessions within a tournament (e.g., "Round 1", "Round 2")

## Functions

### Fetching Broadcasts

#### `getOfficialBroadcasts(page?)`

Fetches official broadcasts from Lichess, sorted by start date.

**Parameters:**
- `page`: (Optional) Page number for pagination, defaults to 1

**Returns:**
A Promise that resolves to an array of official broadcast data objects.

**Example:**
```typescript
import { getOfficialBroadcasts } from '@/lib/lichess/api';

// Get first page of official broadcasts
const broadcasts = await getOfficialBroadcasts();
console.log(`Found ${broadcasts.length} official broadcasts`);

// Get second page
const page2 = await getOfficialBroadcasts(2);
```

#### `getTopBroadcasts(page?)`

Fetches top broadcast previews with pagination.

**Parameters:**
- `page`: (Optional) Page number for pagination, defaults to 1

**Returns:**
A Promise that resolves to a paginated list of top broadcasts or null on error.

**Example:**
```typescript
import { getTopBroadcasts } from '@/lib/lichess/api';

const topBroadcasts = await getTopBroadcasts();
if (topBroadcasts) {
    console.log(`Current page: ${topBroadcasts.currentPage}`);
    console.log(`Total pages: ${topBroadcasts.nbPages}`);
    console.log(`Top broadcasts: ${topBroadcasts.list.length}`);
}
```

#### `getUserBroadcasts(username, page?)`

Fetches broadcasts created by a specific user.

**Parameters:**
- `username`: Username to fetch broadcasts for
- `page`: (Optional) Page number for pagination, defaults to 1

**Returns:**
A Promise that resolves to a paginated list of user broadcasts or null on error.

**Example:**
```typescript
import { getUserBroadcasts } from '@/lib/lichess/api';

const userBroadcasts = await getUserBroadcasts('Chessbrah');
if (userBroadcasts) {
    console.log(`Found ${userBroadcasts.list.length} broadcasts by Chessbrah`);
}
```

#### `getBroadcastTournament(id)`

Fetches data for a specific broadcast tournament.

**Parameters:**
- `id`: Broadcast tournament ID

**Returns:**
A Promise that resolves to the broadcast tournament data or null on error.

**Example:**
```typescript
import { getBroadcastTournament } from '@/lib/lichess/api';

const tournament = await getBroadcastTournament('xyz123');
if (tournament) {
    console.log(`Tournament: ${tournament.name}`);
    console.log(`Rounds: ${tournament.rounds.length}`);
}
```

#### `getBroadcastPlayers(id)`

Fetches players participating in a broadcast tournament.

**Parameters:**
- `id`: Broadcast tournament ID

**Returns:**
A Promise that resolves to a list of players or null on error.

**Example:**
```typescript
import { getBroadcastPlayers } from '@/lib/lichess/api';

const players = await getBroadcastPlayers('xyz123');
if (players) {
    console.log(`Number of players: ${players.length}`);
    console.log(`First player: ${players[0].name}`);
}
```

#### `getMyBroadcastRounds()`

Fetches broadcast rounds created by the current authenticated user.

**Authentication Required:** Yes

**Returns:**
A Promise that resolves to a list of your broadcast rounds or null on error.

**Example:**
```typescript
import { getMyBroadcastRounds } from '@/lib/lichess/api';

try {
    const myRounds = await getMyBroadcastRounds();
    if (myRounds) {
        console.log(`You've created ${myRounds.length} broadcast rounds`);
    }
} catch (error) {
    // Handle authentication error
    console.error('Authentication required:', error);
}
```

### Creating and Updating Broadcasts

#### `createBroadcastTournament(data)`

Creates a new broadcast tournament.

**Authentication Required:** Yes

**Parameters:**
- `data`: Tournament data object
    - `name`: Name of the tournament (required)
    - `description`: (Optional) Tournament description
    - `source`: (Optional) Source URL or description
    - `markdown`: (Optional) Markdown content for the tournament page
    - `credits`: (Optional) Credits information
    - `autoLeaderboard`: (Optional) Whether to automatically generate a leaderboard

**Returns:**
A Promise that resolves to the created broadcast tournament data.

**Example:**
```typescript
import { createBroadcastTournament } from '@/lib/lichess/api';

try {
    const tournament = await createBroadcastTournament({
        name: 'My Chess Tournament 2025',
        description: 'A friendly tournament',
        autoLeaderboard: true
    });
    
    console.log(`Created tournament with ID: ${tournament.id}`);
} catch (error) {
    console.error('Failed to create tournament:', error);
}
```

#### `updateBroadcastTournament(id, data)`

Updates an existing broadcast tournament.

**Authentication Required:** Yes

**Parameters:**
- `id`: Broadcast tournament ID
- `data`: Updated tournament data (same fields as `createBroadcastTournament`)

**Returns:**
A Promise that resolves to the updated broadcast tournament data.

**Example:**
```typescript
import { updateBroadcastTournament } from '@/lib/lichess/api';

try {
    const updated = await updateBroadcastTournament('xyz123', {
        name: 'Updated Tournament Name',
        description: 'New description'
    });
    
    console.log(`Updated tournament: ${updated.name}`);
} catch (error) {
    console.error('Failed to update tournament:', error);
}
```

#### `createBroadcastRound(tournamentId, data)`

Creates a new round within a broadcast tournament.

**Authentication Required:** Yes

**Parameters:**
- `tournamentId`: ID of the tournament to create the round in
- `data`: Round data object
    - `name`: Name of the round (required)
    - `description`: (Optional) Round description
    - `syncUrl`: (Optional) URL to synchronize PGN from
    - `syncUrls`: (Optional) Multiple URLs separated by commas
    - `syncIds`: (Optional) Lichess study IDs to sync from
    - `syncUsers`: (Optional) Lichess usernames to sync studies from
    - `startsAt`: (Optional) Round start time (ISO 8601 format)
    - `delay`: (Optional) Relay delay in seconds

**Returns:**
A Promise that resolves to the created broadcast round data.

**Example:**
```typescript
import { createBroadcastRound } from '@/lib/lichess/api';

try {
    const round = await createBroadcastRound('xyz123', {
        name: 'Round 1',
        description: 'Opening round',
        syncUrl: 'https://example.com/round1.pgn',
        startsAt: '2025-04-01T12:00:00Z',
        delay: 30
    });
    
    console.log(`Created round with ID: ${round.id}`);
} catch (error) {
    console.error('Failed to create round:', error);
}
```

#### `updateBroadcastRound(roundId, data)`

Updates an existing broadcast round.

**Authentication Required:** Yes

**Parameters:**
- `roundId`: Broadcast round ID
- `data`: Updated round data (same fields as `createBroadcastRound`)

**Returns:**
A Promise that resolves to the updated broadcast round data.

**Example:**
```typescript
import { updateBroadcastRound } from '@/lib/lichess/api';

try {
    const updated = await updateBroadcastRound('abc456', {
        name: 'Round 1 - Updated',
        syncUrl: 'https://example.com/updated-round1.pgn',
        delay: 60
    });
    
    console.log(`Updated round: ${updated.name}`);
} catch (error) {
    console.error('Failed to update round:', error);
}
```

#### `resetBroadcastRound(roundId)`

Resets a broadcast round, clearing all game data.

**Authentication Required:** Yes

**Parameters:**
- `roundId`: Broadcast round ID

**Returns:**
A Promise that resolves to the status of the reset operation.

**Example:**
```typescript
import { resetBroadcastRound } from '@/lib/lichess/api';

try {
    const result = await resetBroadcastRound('abc456');
    console.log('Round reset successfully:', result);
} catch (error) {
    console.error('Failed to reset round:', error);
}
```

#### `pushBroadcastRoundPgn(roundId, pgn)`

Pushes PGN data to a broadcast round.

**Authentication Required:** Yes

**Parameters:**
- `roundId`: Broadcast round ID
- `pgn`: PGN data as a string

**Returns:**
A Promise that resolves to true if successful.

**Example:**
```typescript
import { pushBroadcastRoundPgn } from '@/lib/lichess/api';

try {
    const pgn = `[Event "World Championship Match"]
[Site "London ENG"]
[Date "2025.04.01"]
[Round "1"]
[White "Player, White"]
[Black "Player, Black"]
[Result "1-0"]

1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O 1-0`;

    const success = await pushBroadcastRoundPgn('abc456', pgn);
    if (success) {
        console.log('PGN data pushed successfully');
    }
} catch (error) {
    console.error('Failed to push PGN data:', error);
}
```

### Exporting and Streaming

#### `streamBroadcastRoundPgn(roundId)`

Streams a broadcast round as PGN data.

**Parameters:**
- `roundId`: Broadcast round ID

**Returns:**
A Promise that resolves to a ReadableStream of PGN data or null on error.

**Example:**
```typescript
import { streamBroadcastRoundPgn } from '@/lib/lichess/api';

const stream = await streamBroadcastRoundPgn('abc456');
if (stream) {
    // Work with the stream (e.g., pipe it to a file or process it)
    const reader = stream.getReader();
    let result = '';
    
    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        result += new TextDecoder().decode(value);
    }
    
    console.log('Streamed PGN data:', result);
}
```

#### `exportBroadcastRoundPgn(roundId)`

Exports a broadcast round as PGN data.

**Parameters:**
- `roundId`: Broadcast round ID

**Returns:**
A Promise that resolves to PGN data as a string or null on error.

**Example:**
```typescript
import { exportBroadcastRoundPgn } from '@/lib/lichess/api';

const pgn = await exportBroadcastRoundPgn('abc456');
if (pgn) {
    console.log('PGN data:', pgn);
    // Save to file, display in UI, etc.
}
```

#### `exportBroadcastTournamentPgn(tournamentId)`

Exports all rounds of a broadcast tournament as PGN data.

**Parameters:**
- `tournamentId`: Broadcast tournament ID

**Returns:**
A Promise that resolves to PGN data as a string or null on error.

**Example:**
```typescript
import { exportBroadcastTournamentPgn } from '@/lib/lichess/api';

const pgn = await exportBroadcastTournamentPgn('xyz123');
if (pgn) {
    console.log('Tournament PGN data length:', pgn.length);
    // Save to file, display in UI, etc.
}
```

### Common Use Cases

#### Creating a Complete Broadcast

**Example:**
```typescript
import { 
    createBroadcastTournament, 
    createBroadcastRound,
    pushBroadcastRoundPgn
} from '@/lib/lichess/api';

async function createCompleteBroadcast() {
    try {
        // 1. Create the tournament
        const tournament = await createBroadcastTournament({
            name: 'Local Chess Championship 2025',
            description: 'City championship matches',
            autoLeaderboard: true
        });
        
        // 2. Create rounds
        const round1 = await createBroadcastRound(tournament.id, {
            name: 'Round 1',
            startsAt: '2025-04-15T14:00:00Z'
        });
        
        const round2 = await createBroadcastRound(tournament.id, {
            name: 'Round 2',
            startsAt: '2025-04-16T14:00:00Z'
        });
        
        // 3. Push PGN data to a round
        const pgn = `[Event "Local Chess Championship"]
[Site "Our City"]
[Date "2025.04.15"]
[Round "1"]
[White "Local, Player1"]
[Black "Local, Player2"]
[Result "1-0"]

1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O 1-0`;
        
        await pushBroadcastRoundPgn(round1.id, pgn);
        
        console.log('Broadcast created and populated successfully');
        return tournament.id;
    } catch (error) {
        console.error('Failed to create broadcast:', error);
        throw error;
    }
}
```

#### Displaying a Broadcast Round

**Example:**
```typescript
import { getBroadcastTournament, exportBroadcastRoundPgn } from '@/lib/lichess/api';

async function displayBroadcastRound(tournamentId, roundName) {
    try {
        // 1. Get the tournament data
        const tournament = await getBroadcastTournament(tournamentId);
        if (!tournament) {
            throw new Error('Tournament not found');
        }
        
        // 2. Find the specific round
        const round = tournament.rounds.find(r => r.name === roundName);
        if (!round) {
            throw new Error(`Round "${roundName}" not found`);
        }
        
        // 3. Get the PGN data for the round
        const pgn = await exportBroadcastRoundPgn(round.id);
        if (!pgn) {
            throw new Error('Failed to fetch round PGN');
        }
        
        // 4. Process or display the PGN
        console.log(`Tournament: ${tournament.name}`);
        console.log(`Round: ${round.name}`);
        console.log(`PGN: ${pgn.substring(0, 100)}...`);
        
        return {
            tournament,
            round,
            pgn
        };
    } catch (error) {
        console.error('Error displaying broadcast round:', error);
        throw error;
    }
}
```