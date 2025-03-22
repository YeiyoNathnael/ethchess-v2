# Account API

The Account API provides functions to interact with user accounts on Lichess, including fetching user profiles, games, email addresses, and preferences.

## Functions

### `fetchUserProfile(options?)`

Fetches the current user's profile information from Lichess.

**Parameters:**
- `options`: (Optional) Request options
    - `noCache`: Set to `true` to bypass cache

**Returns:**
- A Promise that resolves to the user's profile data (`LichessUser`) or `null` if not authenticated.

**Example:**
```typescript
import { fetchUserProfile } from '@/lib/lichess/api';

// Fetch the current user's profile
const profile = await fetchUserProfile();
if (profile) {
    console.log(`Hello, ${profile.username}!`);
    console.log(`Rapid rating: ${profile.perfs.rapid.rating}`);
}
```

### `fetchUserGames(username?, options?)`

Fetches games for a user. If no username is provided, fetches games for the current authenticated user.

**Parameters:**
- `username`: (Optional) Username to fetch games for
- `options`: (Optional) Options for filtering the games
    - `max`: Maximum number of games to fetch
    - `rated`: Whether to only include rated games
    - `perfType`: Filter by performance type (e.g., "blitz", "rapid")
    - `color`: Filter by color ('white' or 'black')
    - `analysed`: Whether to only include analyzed games
    - `ongoing`: Whether to include ongoing games
    - `finished`: Whether to include finished games
    - `lastFen`: Whether to include the last position FEN
    - `moves`: Whether to include moves
    - `pgnInJson`: Whether to include PGN in JSON
    - `tags`: Whether to include tags
    - `clocks`: Whether to include clock information
    - `evals`: Whether to include evaluations
    - `opening`: Whether to include opening information

**Returns:**
- A Promise that resolves to an array of games or `null` on error.

**Example:**
```typescript
import { fetchUserGames } from '@/lib/lichess/api';

// Fetch the last 10 blitz games for a specific user
const games = await fetchUserGames('username', {
  max: 10,
  perfType: 'blitz',
  finished: true
});

if (games) {
  console.log(`Fetched ${games.length} games`);
  games.forEach(game =>  {
    console.log(`Game ID: ${game.id}, Result: ${game.winner ? `${game.winner} won` : 'Draw'}`);
  });
}
```

### `fetchUserEmail()`

Fetches the email address of the current user. Requires the 'email:read' scope.

**Returns:**
- A Promise that resolves to the user's email address as a string or `null` if not authenticated or on error.

**Example:**
```typescript
import { fetchUserEmail } from '@/lib/lichess/api';

// Fetch the user's email
const email = await fetchUserEmail();
if (email) {
  console.log(`Your email is: ${email}`);
}
```

### `fetchUserPreferences()`

Fetches the current user's preferences. Requires the 'preference:read' scope.

**Returns:**
- A Promise that resolves to an object containing user preferences or `null` if not authenticated or on error.

**Example:**
```typescript
import { fetchUserPreferences } from '@/lib/lichess/api';

// Fetch user preferences
const preferences = await fetchUserPreferences();
if (preferences) {
  console.log('Dark mode:', preferences.dark ? 'enabled' : 'disabled');
  console.log('Piece set:', preferences.pieceSet);
}
```

### `fetchKidModeStatus()`

Fetches the current user's kid mode status. Requires the 'preference:read' scope.

**Returns:**
- A Promise that resolves to a boolean indicating if kid mode is enabled or `null` if not authenticated or on error.

**Example:**
```typescript
import { fetchKidModeStatus } from '@/lib/lichess/api';

// Check if kid mode is enabled
const kidMode = await fetchKidModeStatus();
if (kidMode !== null) {
  console.log(`Kid mode is ${kidMode ? 'enabled' : 'disabled'}`);
}
```

## Types

### `GameListOptions`

Options for fetching user games.

```typescript
interface GameListOptions {
  /** Maximum number of games to fetch */
  max?: number;
  /** Whether to only include rated games */
  rated?: boolean;
  /** Filter by performance type (e.g., "blitz", "rapid") */
  perfType?: string;
  /** Filter by color */
  color?: 'white' | 'black';
  /** Whether to only include analyzed games */
  analysed?: boolean;
  /** Whether to include ongoing games */
  ongoing?: boolean;
  /** Whether to include finished games */
  finished?: boolean;
  /** Whether to include the last position FEN */
  lastFen?: boolean;
  /** Whether to include moves */
  moves?: boolean;
  /** Whether to include PGN in JSON */
  pgnInJson?: boolean;
  /** Whether to include tags */
  tags?: boolean;
  /** Whether to include clock information */
  clocks?: boolean;
  /** Whether to include evaluations */
  evals?: boolean;
  /** Whether to include opening information */
  opening?: boolean;
}
```

### `LichessUser`

The Lichess user profile object returned by `fetchUserProfile()`. This type is imported from the library's types module.

Key properties include:
- `id`: User ID
- `username`: Display name
- `title`: Chess title (e.g., "GM", "IM")
- `perfs`: Performance ratings in different game variants
- `playing`: URL of the game currently being played (if any)
- `count`: Various count statistics
- And many other user properties