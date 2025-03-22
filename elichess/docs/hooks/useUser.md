# useUser Hooks

The `useUser` hooks provide access to Lichess user data in your React components. These hooks make it easy to fetch, display, and manage user profiles, preferences, and game history.

## Overview

User data is central to many chess applications. The `useUser` hooks allow you to:

- Fetch the current authenticated user's profile
- Access user preferences and settings
- Retrieve a user's game history
- Refresh user data when needed

## Available Hooks

### `useUser`

Primary hook for accessing the current authenticated user's data.

**Returns:**

- `user`: The user profile object, or null if not authenticated/loaded
- `preferences`: User preferences object, or null if not loaded
- `loading`: Boolean indicating if user data is being fetched
- `error`: Error object if the fetch failed, otherwise null
- `refresh`: Function to manually refresh the user profile
- `fetchPreferences`: Function to fetch user preferences

**Example:**

```jsx
import { useUser } from '@/lib/lichess/hooks';

function UserProfile() {
    const { user, loading, error } = useUser();
    
    if (loading) return <div>Loading profile...</div>;
    if (error) return <div>Error: {error.message}</div>;
    if (!user) return <div>Please log in to view your profile</div>;
    
    return (
        <div className="user-profile">
            <h2>{user.username}</h2>
            <div className="profile-details">
                <p>Rating: {user.perfs.classical.rating}</p>
                <p>Games played: {user.count.all}</p>
                {user.profile && (
                    <>
                        <p>Bio: {user.profile.bio}</p>
                        <p>Country: {user.profile.country}</p>
                    </>
                )}
            </div>
        </div>
    );
}
```

### `useUserGames`

Hook for fetching a user's game history.

**Parameters:**

- `username`: (Optional) Username to fetch games for. If not provided, fetches games for the current user.
- `options`: (Optional) Object with options:
    - `max`: Maximum number of games to fetch (default: 10)
    - `ongoing`: Include ongoing games (default: true)
    - `finished`: Include finished games (default: true)

**Returns:**

- `games`: Array of game objects
- `loading`: Boolean indicating if games are being fetched
- `error`: Error object if the fetch failed, otherwise null
- `refresh`: Function to manually refresh the games list

**Example:**

```jsx
import { useUserGames } from '@/lib/lichess/hooks';

function UserGamesList({ username }) {
    const { games, loading, error } = useUserGames(username, { 
        max: 5, 
        ongoing: true, 
        finished: true 
    });
    
    if (loading) return <div>Loading games...</div>;
    if (error) return <div>Error: {error.message}</div>;
    
    return (
        <div className="user-games">
            <h3>Recent Games</h3>
            {games.length > 0 ? (
                <ul className="games-list">
                    {games.map(game => (
                        <li key={game.id}>
                            <a href={`/game/${game.id}`}>
                                {game.players.white.user.name} vs {game.players.black.user.name}
                                <span className="result">
                                    {game.status === 'started' ? 'Ongoing' : game.winner}
                                </span>
                            </a>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No games found</p>
            )}
        </div>
    );
}
```

## User Object Structure

The user object typically includes:

```typescript
interface LichessUser {
    id: string;              // User ID
    username: string;        // Username
    title?: string;          // Chess title (GM, IM, etc.)
    online: boolean;         // Whether the user is online
    perfs: {                 // Performance ratings by category
        chess960: Rating;
        classical: Rating;
        rapid: Rating;
        blitz: Rating;
        bullet: Rating;
        correspondence: Rating;
        // other variants...
    };
    createdAt: number;       // Account creation timestamp
    seenAt: number;          // Last active timestamp
    playTime: {              // Total play time
        total: number;
        tv: number;
    };
    count: {                 // Game counts
        all: number;
        rated: number;
        win: number;
        loss: number;
        draw: number;
        // other counts...
    };
    profile?: {              // Optional profile information
        country?: string;
        location?: string;
        bio?: string;
        firstName?: string;
        lastName?: string;
        links?: string;
    };
    preferences?: {          // User preferences
        // Various preference settings
    };
}

interface Rating {
    games: number;           // Number of games played
    rating: number;          // Current rating
    rd: number;              // Rating deviation
    prog: number;            // Recent rating progress
}
```

## Common Use Cases

### Authentication-Aware Components

```jsx
import { useUser } from '@/lib/lichess/hooks';

function AuthAwareNavigation() {
    const { user, loading } = useUser();
    
    return (
        <nav className="main-nav">
            {/* Always visible links */}
            
            {!loading && (
                user ? (
                    <>
                        <a href="/account">My Account</a>
                        <a href="/logout">Log Out</a>
                    </>
                ) : (
                    <a href="/login">Log In</a>
                )
            )}
        </nav>
    );
}
```

### User Preferences Panel

```jsx
import { useUser } from '@/lib/lichess/hooks';

function UserPreferences() {
    const { preferences, fetchPreferences, loading } = useUser();
    
    // Fetch preferences when component mounts
    useEffect(() => {
        if (!preferences) {
            fetchPreferences();
        }
    }, [preferences, fetchPreferences]);
    
    if (loading) return <div>Loading preferences...</div>;
    if (!preferences) return <div>Unable to load preferences</div>;
    
    return (
        <div className="preferences-panel">
            <h2>Your Preferences</h2>
            <div className="preference-item">
                <label>Theme:</label>
                <span>{preferences.theme}</span>
            </div>
            <div className="preference-item">
                <label>Board Style:</label>
                <span>{preferences.pieceSet}</span>
            </div>
            {/* Display other preferences */}
        </div>
    );
}
```

### Game History Timeline

```jsx
import { useUserGames } from '@/lib/lichess/hooks';

function GameTimeline({ username }) {
    const { games } = useUserGames(username, { max: 30 });
    
    // Group games by date
    const gamesByDate = groupGamesByDate(games);
    
    return (
        <div className="game-timeline">
            {Object.entries(gamesByDate).map(([date, dateGames]) => (
                <div key={date} className="timeline-day">
                    <h3>{date}</h3>
                    <ul>
                        {dateGames.map(game => (
                            <li key={game.id} className="timeline-game">
                                {/* Game display */}
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    );
}
```

## Best Practices

- **Handle Authentication State**: Use the loading state to avoid showing login messages while authentication is still being determined.
- **Data Refresh**: Implement refresh mechanisms for data that might change during a session.
- **Error Handling**: Always display appropriate error messages when requests fail.
- **Performance Optimization**: For components that only need specific parts of the user data, consider creating more specialized hooks.
- **User Privacy**: Be mindful of what user data you display, especially for public-facing components.
- **Loading States**: Provide good loading indicators to improve user experience.
- **Conditional Fetching**: Only fetch additional data (like preferences) when needed rather than loading everything at once.
- **Caching Considerations**: Be aware that user data might be cached. Use the refresh function when you need the latest data.