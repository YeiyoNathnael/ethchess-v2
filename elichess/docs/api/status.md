# Status API

The Status API provides functions for retrieving real-time information about Lichess users, streamers, top players, and leaderboards.

## Overview

This module allows you to:
- Check the online status and current activity of Lichess users
- Get a list of currently live streamers
- Retrieve top players for different game variants
- Access leaderboards for specific performance categories

## Functions

### `getUsersStatus(userIds, withGameIds?, options?)`

Gets real-time status information for multiple Lichess users.

**Parameters:**
- `userIds`: Array of user IDs to check status
- `withGameIds`: (Optional) Whether to include IDs of games being played, defaults to `false`
- `options`: (Optional) Request options

**Returns:**
A Promise that resolves to an array of user status objects or an empty array on error.

**Example:**
```typescript
import { getUsersStatus } from '@/lib/lichess/api';

// Check status of multiple users
const userIds = ['DrNykterstein', 'Hikaru', 'GothamChess'];
const status = await getUsersStatus(userIds, true);

status.forEach(user => {
    console.log(`${user.name}: ${user.online ? 'Online' : 'Offline'}`);
    
    if (user.playing) {
        console.log(`Currently playing: https://lichess.org/${user.playing}`);
    }
});
```

### `getLiveStreamers(options?)`

Gets a list of currently live streamers on Lichess.

**Parameters:**
- `options`: (Optional) Request options

**Returns:**
A Promise that resolves to an array of streamer objects or an empty array on error.

**Example:**
```typescript
import { getLiveStreamers } from '@/lib/lichess/api';

// Get live streamers
const streamers = await getLiveStreamers();

if (streamers.length > 0) {
    console.log(`Found ${streamers.length} live streamers:`);
    streamers.forEach(streamer => {
        console.log(`${streamer.name} - ${streamer.title || 'Untitled'}`);
        console.log(`  Streaming at: ${streamer.url}`);
    });
} else {
    console.log('No streamers are currently live');
}
```

### `getTopPlayers(options?)`

Gets top players for each variant and speed category.

**Parameters:**
- `options`: (Optional) Request options

**Returns:**
A Promise that resolves to an object containing top players by category or null on error.

**Example:**
```typescript
import { getTopPlayers } from '@/lib/lichess/api';

// Get top players for all categories
const topPlayers = await getTopPlayers();

if (topPlayers) {
    // Display top bullet players
    console.log('Top Bullet Players:');
    topPlayers.bullet.forEach((player, index) => {
        console.log(`${index + 1}. ${player.username} (${player.rating})`);
    });
    
    // Display top rapid players
    console.log('Top Rapid Players:');
    topPlayers.rapid.forEach((player, index) => {
        console.log(`${index + 1}. ${player.username} (${player.rating})`);
    });
}
```

### `getLeaderboard(perfType, nb?, options?)`

Gets the leaderboard for a specific performance category.

**Parameters:**
- `perfType`: The performance category (e.g., 'bullet', 'blitz', 'rapid', 'classical')
- `nb`: (Optional) Number of players to get (max 200), defaults to 100
- `options`: (Optional) Request options

**Returns:**
A Promise that resolves to the leaderboard data or null on error.

**Example:**
```typescript
import { getLeaderboard } from '@/lib/lichess/api';

// Get top 50 blitz players
const blitzLeaderboard = await getLeaderboard('blitz', 50);

if (blitzLeaderboard && blitzLeaderboard.users) {
    console.log('Top Blitz Players:');
    blitzLeaderboard.users.forEach((player, index) => {
        console.log(`${index + 1}. ${player.username} (${player.perfs.blitz.rating})`);
    });
}

// Get top 10 classical players
const classicalLeaderboard = await getLeaderboard('classical', 10);

if (classicalLeaderboard && classicalLeaderboard.users) {
    console.log('Top Classical Players:');
    classicalLeaderboard.users.forEach((player, index) => {
        console.log(`${index + 1}. ${player.username} (${player.perfs.classical.rating})`);
    });
}
```

## Response Data Structures

### User Status

The user status objects contain:
```typescript
interface UserStatus {
    /** User's Lichess ID */
    id: string;
    /** User's display name */
    name: string;
    /** Whether the user is currently online */
    online: boolean;
    /** ID of the game the user is currently playing (if any) */
    playing?: string;
    /** Whether the user is currently streaming */
    streaming?: boolean;
    /** Whether the user is patron/supporter */
    patron?: boolean;
    /** Unique playban status (only if patrons) */
    playban?: boolean;
}
```

### Streamer

The streamer objects contain:
```typescript
interface Streamer {
    /** Streamer's Lichess ID */
    id: string;
    /** Streamer's display name */
    name: string;
    /** Streamer's title, if any (GM, IM, etc.) */
    title?: string;
    /** Streaming platform URL */
    url: string;
}
```

### Top Players

The top players object contains categories like:
```typescript
interface TopPlayers {
    /** Top bullet players */
    bullet: Player[];
    /** Top blitz players */
    blitz: Player[];
    /** Top rapid players */
    rapid: Player[];
    /** Top classical players */
    classical: Player[];
    /** Top ultraBullet players */
    ultraBullet: Player[];
    /** Top chess960 players */
    chess960: Player[];
    /** Top crazyhouse players */
    crazyhouse: Player[];
    /** Top antichess players */
    antichess: Player[];
    /** And other variants... */
}

interface Player {
    /** Player's Lichess ID */
    id: string;
    /** Player's username */
    username: string;
    /** Player's title, if any */
    title?: string;
    /** Player's rating in the variant */
    rating: number;
    /** Whether the player is online */
    online?: boolean;
}
```

## Common Use Cases

### Building a Friend Activity Tracker

```typescript
import { getUsersStatus } from '@/lib/lichess/api';
import { useState, useEffect } from 'react';

function FriendActivityTracker({ friendIds }) {
    const [friendStatus, setFriendStatus] = useState([]);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        // Function to update friend status
        async function updateStatus() {
            if (friendIds.length === 0) {
                setFriendStatus([]);
                setLoading(false);
                return;
            }
            
            try {
                const statusData = await getUsersStatus(friendIds, true);
                setFriendStatus(statusData);
            } catch (error) {
                console.error('Failed to fetch friend status:', error);
            } finally {
                setLoading(false);
            }
        }
        
        // Initial update
        updateStatus();
        
        // Set up polling every 30 seconds
        const intervalId = setInterval(updateStatus, 30000);
        
        return () => {
            clearInterval(intervalId);
        };
    }, [friendIds]);
    
    if (loading) {
        return <div>Loading friend status...</div>;
    }
    
    return (
        <div className="friend-activity">
            <h2>Friend Activity</h2>
            
            {friendStatus.length === 0 ? (
                <p>No friends added or all friends offline.</p>
            ) : (
                <ul className="friend-list">
                    {friendStatus.map(friend => (
                        <li key={friend.id} className={friend.online ? 'online' : 'offline'}>
                            <span className="status-indicator" />
                            <a href={`https://lichess.org/@/${friend.name}`} target="_blank" rel="noopener noreferrer">
                                {friend.name}
                            </a>
                            
                            {friend.playing && (
                                <a 
                                    href={`https://lichess.org/${friend.playing}`} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="watching-link"
                                >
                                    Watch Game
                                </a>
                            )}
                            
                            {friend.streaming && (
                                <span className="streaming-badge">LIVE</span>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
```

### Displaying Live Streamers

```typescript
import { getLiveStreamers } from '@/lib/lichess/api';
import { useState, useEffect } from 'react';

function LiveStreamers() {
    const [streamers, setStreamers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    useEffect(() => {
        async function fetchStreamers() {
            try {
                setLoading(true);
                const data = await getLiveStreamers();
                setStreamers(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        
        fetchStreamers();
        
        // Update every 5 minutes
        const intervalId = setInterval(fetchStreamers, 5 * 60 * 1000);
        
        return () => {
            clearInterval(intervalId);
        };
    }, []);
    
    if (loading) return <div>Loading streamers...</div>;
    if (error) return <div>Error: {error}</div>;
    
    return (
        <div className="live-streamers">
            <h2>Live Chess Streamers</h2>
            
            {streamers.length === 0 ? (
                <p>No chess streamers are currently live.</p>
            ) : (
                <div className="streamer-grid">
                    {streamers.map(streamer => (
                        <div key={streamer.id} className="streamer-card">
                            <div className="streamer-header">
                                <h3>{streamer.title ? `${streamer.title} ` : ''}{streamer.name}</h3>
                                <span className="live-badge">LIVE</span>
                            </div>
                            
                            <a 
                                href={streamer.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="watch-button"
                            >
                                Watch Stream
                            </a>
                            
                            <a 
                                href={`https://lichess.org/@/${streamer.name}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="profile-link"
                            >
                                Lichess Profile
                            </a>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
```

### Leaderboard Display
 
```typescript
import { getLeaderboard } from '@/lib/lichess/api';
import { useState, useEffect } from 'react';

function ChessLeaderboard() {
    const [category, setCategory] = useState('blitz');
    const [leaderboard, setLeaderboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    useEffect(() => {
        async function fetchLeaderboard() {
            try {
                setLoading(true);
                setError(null);
                
                const data = await getLeaderboard(category, 20);
                setLeaderboard(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        
        fetchLeaderboard();
    }, [category]);
    
    function handleCategoryChange(e) {
        setCategory(e.target.value);
    }
    
    return (
        <div className="leaderboard">
            <h2>Lichess Leaderboard</h2>
            
            <div className="category-selector">
                <label htmlFor="category">Category:</label>
                <select 
                    id="category" 
                    value={category} 
                    onChange={handleCategoryChange}
                >
                    <option value="bullet">Bullet</option>
                    <option value="blitz">Blitz</option>
                    <option value="rapid">Rapid</option>
                    <option value="classical">Classical</option>
                    <option value="chess960">Chess960</option>
                    <option value="crazyhouse">Crazyhouse</option>
                    <option value="antichess">Antichess</option>
                    <option value="ultraBullet">UltraBullet</option>
                </select>
            </div>
            
            {loading ? (
                <p>Loading leaderboard...</p>
            ) : error ? (
                <p className="error">Error: {error}</p>
            ) : leaderboard && leaderboard.users ? (
                <table className="leaderboard-table">
                    <thead>
                        <tr>
                            <th>Rank</th>
                            <th>Player</th>
                            <th>Rating</th>
                        </tr>
                    </thead>
                    <tbody>
                        {leaderboard.users.map((player, index) => (
                            <tr key={player.id}>
                                <td>{index + 1}</td>
                                <td>
                                    <a 
                                        href={`https://lichess.org/@/${player.username}`}
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                    >
                                        {player.title ? `${player.title} ` : ''}
                                        {player.username}
                                    </a>
                                </td>
                                <td>{player.perfs[category].rating}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p>No leaderboard data available</p>
            )}
        </div>
    );
}
```
