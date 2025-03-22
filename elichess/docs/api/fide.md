# FIDE API

The FIDE API provides access to information about chess players registered with FIDE (Fédération Internationale des Échecs), the International Chess Federation. This API allows you to look up player profiles and search for players by name or ID.

## Overview

FIDE is the governing body of international chess competitions and maintains official ratings and titles for chess players worldwide. This API interface allows you to:

- Fetch details about a specific FIDE-registered player
- Search for FIDE players by name or ID

## Functions

### `getFidePlayer(playerId)`

Gets information about a specific FIDE player by their ID.

**Parameters:**
- `playerId`: FIDE player ID (string)

**Returns:**
A Promise that resolves to the player information object or `null` on error.

**Example:**
```typescript
import { getFidePlayer } from '@/lib/lichess/api';

// Get information about Magnus Carlsen (example FIDE ID)
const player = await getFidePlayer('1503014');

if (player) {
    console.log(`Name: ${player.name}`);
    console.log(`Title: ${player.title}`);
    console.log(`FIDE Rating: ${player.rating}`);
    console.log(`Federation: ${player.federation}`);
}
```

### `searchFidePlayers(query)`

Searches for FIDE players by name or ID.

**Parameters:**
- `query`: Search query - can be a name or ID (string)

**Returns:**
A Promise that resolves to an array of player search results or `null` on error.

**Example:**
```typescript
import { searchFidePlayers } from '@/lib/lichess/api';

// Search for players with 'Carlsen' in their name
const results = await searchFidePlayers('Carlsen');

if (results) {
    console.log(`Found ${results.length} players`);
    
    results.forEach(player => {
        console.log(`${player.name} (${player.id}) - ${player.title || 'No title'}, ${player.federation}`);
    });
}
```

## Response Data Structure

### Player Information

The player information object typically includes:

```typescript
interface FidePlayer {
    /** FIDE ID */
    id: string;
    /** Player's name */
    name: string;
    /** FIDE title (GM, IM, FM, etc.) if any */
    title?: string;
    /** Current FIDE rating */
    rating?: number;
    /** Peak rating */
    maxRating?: number;
    /** Federation/country the player represents */
    federation: string;
    /** Birth year */
    birthYear?: number;
    /** Gender */
    gender?: string;
    /** Whether the player is active */
    active?: boolean;
    /** Profile URL */
    url?: string;
}
```

Note that the exact fields may vary depending on the available data for each player.

## Common Use Cases

### Display a FIDE Player Profile

```typescript
import { getFidePlayer } from '@/lib/lichess/api';
import { useState, useEffect } from 'react';

function FidePlayerProfile({ playerId }) {
    const [player, setPlayer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    useEffect(() => {
        async function loadPlayer() {
            try {
                setLoading(true);
                const data = await getFidePlayer(playerId);
                
                if (data) {
                    setPlayer(data);
                } else {
                    setError(new Error('Player not found'));
                }
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        }
        
        loadPlayer();
    }, [playerId]);
    
    if (loading) return <div>Loading player information...</div>;
    if (error) return <div>Error: {error.message}</div>;
    if (!player) return <div>Player not found</div>;
    
    return (
        <div className="fide-player-profile">
            <h2>{player.title ? `${player.title} ` : ''}{player.name}</h2>
            <div className="player-details">
                <p><strong>FIDE ID:</strong> {player.id}</p>
                <p><strong>Federation:</strong> {player.federation}</p>
                <p><strong>Rating:</strong> {player.rating || 'Unrated'}</p>
                {player.maxRating && (
                    <p><strong>Peak Rating:</strong> {player.maxRating}</p>
                )}
                {player.birthYear && (
                    <p><strong>Born:</strong> {player.birthYear}</p>
                )}
                <p><strong>Status:</strong> {player.active ? 'Active' : 'Inactive'}</p>
            </div>
            
            {player.url && (
                <a href={player.url} target="_blank" rel="noopener noreferrer">
                    View FIDE Profile
                </a>
            )}
        </div>
    );
}
```

### Create a FIDE Player Search Component

```typescript
import { searchFidePlayers } from '@/lib/lichess/api';
import { useState } from 'react';

function FidePlayerSearch() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    const handleSearch = async (e) => {
        e.preventDefault();
        
        if (!query.trim()) return;
        
        try {
            setLoading(true);
            setError(null);
            
            const data = await searchFidePlayers(query);
            
            if (data) {
                setResults(data);
            } else {
                setResults([]);
                setError(new Error('No results found or search failed'));
            }
        } catch (err) {
            setError(err);
            setResults([]);
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className="fide-player-search">
            <h2>Search FIDE Players</h2>
            
            <form onSubmit={handleSearch}>
                <input 
                    type="text" 
                    value={query} 
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Enter player name or FIDE ID"
                />
                <button type="submit" disabled={loading}>
                    {loading ? 'Searching...' : 'Search'}
                </button>
            </form>
            
            {error && <p className="error">Error: {error.message}</p>}
            
            {results.length > 0 ? (
                <div className="search-results">
                    <h3>Found {results.length} players</h3>
                    <ul>
                        {results.map(player => (
                            <li key={player.id}>
                                <strong>{player.title ? `${player.title} ` : ''}{player.name}</strong>
                                <span> ({player.federation})</span>
                                <p>FIDE ID: {player.id}</p>
                                {player.rating && <p>Rating: {player.rating}</p>}
                            </li>
                        ))}
                    </ul>
                </div>
            ) : query && !loading && (
                <p>No players found matching "{query}"</p>
            )}
        </div>
    );
}
```

## Integration with Other APIs

The FIDE API can be combined with other Lichess APIs to enrich user experiences:

```typescript
import { getFidePlayer, fetchUserProfile } from '@/lib/lichess/api';

async function comparePlayerToFide(lichessUsername) {
    try {
        // Get Lichess profile
        const lichessProfile = await fetchUserProfile(lichessUsername);
        
        if (!lichessProfile) {
            throw new Error('Lichess profile not found');
        }
        
        // If the profile has a FIDE ID, fetch FIDE data
        if (lichessProfile.profile?.fideRating) {
            const fideProfile = await getFidePlayer(lichessProfile.profile.fideId);
            
            return {
                lichess: {
                    username: lichessProfile.username,
                    rating: lichessProfile.perfs.classical?.rating || 'Unrated'
                },
                fide: fideProfile ? {
                    id: fideProfile.id,
                    name: fideProfile.name,
                    rating: fideProfile.rating || 'Unrated'
                } : null
            };
        }
        
        return {
            lichess: {
                username: lichessProfile.username,
                rating: lichessProfile.perfs.classical?.rating || 'Unrated'
            },
            fide: null
        };
    } catch (error) {
        console.error('Error comparing player profiles:', error);
        throw error;
    }
}
```