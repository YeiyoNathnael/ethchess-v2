# useFide Hooks

The `useFide` hooks provide easy access to FIDE (World Chess Federation) player data in your React components. These hooks allow you to fetch information about chess players with official FIDE ratings and search the FIDE player database.

## Overview

FIDE maintains the official international chess ratings and titles. These hooks enable you to:

- Fetch a player's profile using their FIDE ID
- Search for players by name in the FIDE database

## Hooks

### `useFidePlayer`

Hook for fetching a FIDE player's profile data.

**Parameters:**
- `playerId`: FIDE ID of the player (string or null)

**Returns:**
- `player`: Player data object (or null if not loaded)
- `loading`: Boolean indicating if player data is being fetched
- `error`: Error object if the fetch failed, otherwise null
- `refresh`: Function to manually refresh the player data

**Example:**
```jsx
import { useFidePlayer } from '@/lib/lichess/hooks';

function PlayerProfile({ fideId }) {
    const { player, loading, error } = useFidePlayer(fideId);

    if (loading) return <div>Loading player data...</div>;
    if (error) return <div>Error: {error.message}</div>;
    if (!player) return <div>No player found</div>;

    return (
        <div className="fide-player">
            <h2>{player.name}</h2>
            <div className="player-details">
                <div>FIDE ID: {player.fideId}</div>
                <div>Country: {player.country}</div>
                <div>Title: {player.title || 'None'}</div>
                <div>Rating: {player.rating}</div>
                <div>World Rank: {player.worldRank}</div>
                {player.birthYear && <div>Born: {player.birthYear}</div>}
            </div>
            <h3>Rating History</h3>
            <div className="rating-history">
                <div>Current Classical: {player.classicalRating}</div>
                <div>Peak Classical: {player.peakClassicalRating}</div>
                <div>Current Rapid: {player.rapidRating}</div>
                <div>Current Blitz: {player.blitzRating}</div>
            </div>
        </div>
    );
}
```

### `useFideSearch`

Hook for searching players in the FIDE database.

**Returns:**
- `results`: Array of player search results
- `loading`: Boolean indicating if search is in progress
- `error`: Error object if the search failed, otherwise null
- `search`: Function to perform a search query

**Example:**
```jsx
import { useFideSearch } from '@/lib/lichess/hooks';
import { useState } from 'react';

function FidePlayerSearch() {
    const [query, setQuery] = useState('');
    const { results, loading, error, search } = useFideSearch();

    const handleSearch = (e) => {
        e.preventDefault();
        search(query);
    };

    return (
        <div className="fide-search">
            <h2>Search FIDE Players</h2>
            <form onSubmit={handleSearch}>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Enter player name"
                    minLength={2}
                />
                <button type="submit" disabled={loading || query.length < 2}>
                    {loading ? 'Searching...' : 'Search'}
                </button>
            </form>
            {error && <div className="error">Error: {error.message}</div>}
            <div className="search-results">
                {results.length > 0 ? (
                    <ul>
                        {results.map(player => (
                            <li key={player.fideId}>
                                <span className="player-name">
                                    {player.title && <span className="title">{player.title}</span>}
                                    {player.name}
                                </span>
                                <span className="player-country">{player.country}</span>
                                <span className="player-rating">{player.rating}</span>
                                <a href={`/player/fide/${player.fideId}`}>View Profile</a>
                            </li>
                        ))}
                    </ul>
                ) : (
                    query.length > 0 && !loading && <p>No players found</p>
                )}
            </div>
        </div>
    );
}
```

## Common Use Cases

### Displaying Player Rating Card

```jsx
import { useFidePlayer } from '@/lib/lichess/hooks';

function PlayerRatingCard({ fideId }) {
    const { player, loading } = useFidePlayer(fideId);
    
    if (loading) return <div className="skeleton-card" />;
    if (!player) return null;
    
    return (
        <div className="rating-card">
            <div className="player-header">
                <h3>
                    {player.title && <span className="title">{player.title}</span>}
                    {player.name}
                </h3>
                <div className="federation">{player.country}</div>
            </div>
            <div className="ratings-grid">
                <div className="rating-box">
                    <div className="rating-type">Classical</div>
                    <div className="rating-value">{player.classicalRating || '—'}</div>
                </div>
                <div className="rating-box">
                    <div className="rating-type">Rapid</div>
                    <div className="rating-value">{player.rapidRating || '—'}</div>
                </div>
                <div className="rating-box">
                    <div className="rating-type">Blitz</div>
                    <div className="rating-value">{player.blitzRating || '—'}</div>
                </div>
            </div>
        </div>
    );
}
```

### Comparing Lichess and FIDE Ratings

```jsx
import { useFidePlayer } from '@/lib/lichess/hooks';
import { usePlayer } from '@/lib/lichess/hooks';

function PlayerRatingComparison({ username, fideId }) {
    const { player: lichessPlayer } = usePlayer(username);
    const { player: fidePlayer } = useFidePlayer(fideId);
    
    if (!lichessPlayer || !fidePlayer) {
        return <div>Loading player data...</div>;
    }
    
    return (
        <div className="ratings-comparison">
            <h2>Rating Comparison</h2>
            <table className="comparison-table">
                <thead>
                    <tr>
                        <th>Time Control</th>
                        <th>Lichess Rating</th>
                        <th>FIDE Rating</th>
                        <th>Difference</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Classical</td>
                        <td>{lichessPlayer.perfs.classical?.rating || '—'}</td>
                        <td>{fidePlayer.classicalRating || '—'}</td>
                        <td>
                            {lichessPlayer.perfs.classical?.rating && fidePlayer.classicalRating 
                                ? lichessPlayer.perfs.classical.rating - fidePlayer.classicalRating 
                                : '—'}
                        </td>
                    </tr>
                    <tr>
                        <td>Rapid</td>
                        <td>{lichessPlayer.perfs.rapid?.rating || '—'}</td>
                        <td>{fidePlayer.rapidRating || '—'}</td>
                        <td>
                            {lichessPlayer.perfs.rapid?.rating && fidePlayer.rapidRating 
                                ? lichessPlayer.perfs.rapid.rating - fidePlayer.rapidRating 
                                : '—'}
                        </td>
                    </tr>
                    <tr>
                        <td>Blitz</td>
                        <td>{lichessPlayer.perfs.blitz?.rating || '—'}</td>
                        <td>{fidePlayer.blitzRating || '—'}</td>
                        <td>
                            {lichessPlayer.perfs.blitz?.rating && fidePlayer.blitzRating 
                                ? lichessPlayer.perfs.blitz.rating - fidePlayer.blitzRating 
                                : '—'}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}
```

### Autocomplete FIDE Player Search

```jsx
import { useFideSearch } from '@/lib/lichess/hooks';
import { useState, useEffect } from 'react';

function FidePlayerAutocomplete({ onSelect }) {
    const [query, setQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const { results, loading, search } = useFideSearch();
    
    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(query);
        }, 300);
        
        return () => clearTimeout(timer);
    }, [query]);
    
    // Perform search when debounced query changes
    useEffect(() => {
        if (debouncedQuery.length >= 2) {
            search(debouncedQuery);
        }
    }, [debouncedQuery, search]);
    
    const handleSelect = (player) => {
        onSelect(player);
        setQuery('');
    };
    
    return (
        <div className="fide-autocomplete">
            <div className="search-input">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search FIDE players..."
                />
                {loading && <span className="loading-indicator">Loading...</span>}
            </div>
            {query.length >= 2 && results.length > 0 && (
                <ul className="suggestions">
                    {results.map(player => (
                        <li 
                            key={player.fideId}
                            onClick={() => handleSelect(player)}
                        >
                            <span className="name">
                                {player.title && <span className="title">{player.title}</span>}
                                {player.name}
                            </span>
                            <span className="details">
                                {player.country} • {player.rating}
                            </span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
```

## FIDE Player Data Structure

The FIDE player object typically includes the following properties:

```typescript
interface FidePlayer {
    fideId: string;        // FIDE ID
    name: string;          // Player's full name
    country: string;       // Country code (e.g., "USA", "RUS")
    title?: string;        // Chess title (GM, IM, FM, etc.)
    rating: number;        // Current standard rating
    classicalRating: number; // Classical rating
    rapidRating?: number;  // Rapid rating (if available)
    blitzRating?: number;  // Blitz rating (if available)
    birthYear?: number;    // Year of birth (if available)
    sex?: string;          // Gender
    worldRank?: number;    // World ranking
    continentalRank?: number; // Continental ranking
    nationalRank?: number; // National ranking
    peakClassicalRating?: number; // Historical peak classical rating
    inactive?: boolean;    // Whether the player is currently inactive
}
```

## Best Practices

- **Error Handling**: Always check the error value and display appropriate messages to users.
- **Loading States**: Use the loading state to show loading indicators during data fetching.
- **Null Handling**: Check for null values in player data, as not all fields are guaranteed to be present.
- **Cache Results**: Consider caching search results to reduce API calls for repeated searches.
- **Minimum Query Length**: For search functionality, require a minimum of 2 characters before triggering a search to avoid excessive API calls.
- **Debounce Search**: Debounce search input to prevent multiple API calls as the user types.