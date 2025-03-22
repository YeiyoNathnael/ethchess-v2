# useBroadcasts Hooks

The Lichess broadcast hooks provide a set of React hooks for working with Lichess broadcasts. Broadcasts are used for streaming live chess events, tournaments, and matches with real-time updates.

## Overview

These hooks simplify the process of fetching, creating, and managing Lichess broadcasts in your React applications. They handle loading states, error handling, and data refreshing so you can focus on building your UI.

## Available Hooks

### `useOfficialBroadcasts`

Fetches official broadcasts from Lichess.

**Parameters:**
- `page`: (Optional) Page number for pagination, defaults to 1

**Returns:**
- `broadcasts`: Array of broadcast data
- `loading`: Boolean indicating if broadcasts are being fetched
- `error`: Error object if the fetch failed, otherwise null
- `refresh`: Function to manually refresh the broadcasts

**Example:**
```jsx
import { useOfficialBroadcasts } from '@/lib/lichess/hooks';

function OfficialBroadcasts() {
    const { broadcasts, loading, error, refresh } = useOfficialBroadcasts();

    if (loading) return <div>Loading broadcasts...</div>;
    if (error) return <div>Error: {error.message}</div>;

    return (
        <div>
            <h2>Official Broadcasts</h2>
            <button onClick={refresh}>Refresh</button>
            {broadcasts.length > 0 ? (
                <ul>
                    {broadcasts.map(broadcast => (
                        <li key={broadcast.id}>
                            <a href={`/broadcast/${broadcast.slug}/${broadcast.id}`}>
                                {broadcast.name}
                            </a>
                            <span>{new Date(broadcast.startsAt).toLocaleString()}</span>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No official broadcasts available.</p>
            )}
        </div>
    );
}
```

### `useTopBroadcasts`

Fetches popular broadcasts from Lichess.

**Parameters:**
- `page`: (Optional) Page number for pagination, defaults to 1

**Returns:**
- `broadcasts`: Broadcast data including pagination information
- `loading`: Boolean indicating if broadcasts are being fetched
- `error`: Error object if the fetch failed, otherwise null
- `refresh`: Function to manually refresh the broadcasts

**Example:**
```jsx
import { useTopBroadcasts } from '@/lib/lichess/hooks';

function TopBroadcasts() {
    const { broadcasts, loading, error } = useTopBroadcasts();

    if (loading) return <div>Loading top broadcasts...</div>;
    if (error) return <div>Error: {error.message}</div>;
    if (!broadcasts) return <div>No broadcasts available</div>;

    return (
        <div>
            <h2>Popular Broadcasts</h2>
            
            <div className="broadcasts-grid">
                {broadcasts.currentPageResults.map(broadcast => (
                    <div key={broadcast.id} className="broadcast-card">
                        <h3>{broadcast.name}</h3>
                        <p>{broadcast.description}</p>
                        <div className="broadcast-meta">
                            <span>{broadcast.rounds?.length || 0} rounds</span>
                            <span>By {broadcast.owner.name}</span>
                        </div>
                        <a href={`/broadcast/${broadcast.slug}/${broadcast.id}`} className="view-link">
                            View Broadcast
                        </a>
                    </div>
                ))}
            </div>
            
            <div className="pagination">
                <span>Page {broadcasts.page} of {broadcasts.nbPages}</span>
            </div>
        </div>
    );
}
```

### `useUserBroadcasts`

Fetches broadcasts created by a specific user.

**Parameters:**
- `username`: Username of the broadcaster (or null if not specified)
- `page`: (Optional) Page number for pagination, defaults to 1

**Returns:**
- `broadcasts`: Broadcast data for the specified user
- `loading`: Boolean indicating if broadcasts are being fetched
- `error`: Error object if the fetch failed, otherwise null
- `refresh`: Function to manually refresh the broadcasts

**Example:**
```jsx
import { useUserBroadcasts } from '@/lib/lichess/hooks';
import { useState } from 'react';

function UserBroadcastsViewer() {
    const [username, setUsername] = useState('');
    const [searchedUser, setSearchedUser] = useState(null);
    
    const { broadcasts, loading, error } = useUserBroadcasts(searchedUser);
    
    const handleSearch = (e) => {
        e.preventDefault();
        setSearchedUser(username.trim());
    };
    
    return (
        <div>
            <h2>User Broadcasts</h2>
            
            <form onSubmit={handleSearch}>
                <input 
                    type="text" 
                    value={username} 
                    onChange={e => setUsername(e.target.value)} 
                    placeholder="Enter username"
                />
                <button type="submit">Search</button>
            </form>
            
            {loading && <div>Loading...</div>}
            {error && <div>Error: {error.message}</div>}
            
            {broadcasts && broadcasts.nbResults > 0 ? (
                <div className="user-broadcasts">
                    <h3>Broadcasts by {searchedUser}</h3>
                    <p>Found {broadcasts.nbResults} broadcasts</p>
                    
                    <ul className="broadcasts-list">
                        {broadcasts.currentPageResults.map(broadcast => (
                            <li key={broadcast.id}>
                                <a href={`/broadcast/${broadcast.slug}/${broadcast.id}`}>
                                    {broadcast.name}
                                </a>
                                <p>{broadcast.description}</p>
                            </li>
                        ))}
                    </ul>
                </div>
            ) : searchedUser ? (
                <p>No broadcasts found for {searchedUser}.</p>
            ) : null}
        </div>
    );
}
```

### `useBroadcastTournament`

Fetches data for a specific broadcast tournament.

**Parameters:**
- `tournamentId`: ID of the tournament to fetch (or null if not specified)

**Returns:**
- `tournament`: Tournament data object
- `loading`: Boolean indicating if tournament is being fetched
- `error`: Error object if the fetch failed, otherwise null
- `refresh`: Function to manually refresh the tournament data

**Example:**
```jsx
import { useBroadcastTournament } from '@/lib/lichess/hooks';
import { useRouter } from 'next/router';

function BroadcastTournamentPage() {
    const router = useRouter();
    const { id } = router.query;
    
    const { tournament, loading, error } = useBroadcastTournament(id);
    
    if (loading) return <div>Loading tournament...</div>;
    if (error) return <div>Error: {error.message}</div>;
    if (!tournament) return <div>Tournament not found</div>;
    
    return (
        <div className="broadcast-tournament">
            <h1>{tournament.name}</h1>
            <div className="broadcast-description" dangerouslySetInnerHTML={{ __html: tournament.description }} />
            
            <div className="broadcast-metadata">
                <div className="organizer">
                    Organized by: <a href={`/@/${tournament.owner.name}`}>{tournament.owner.name}</a>
                </div>
                {tournament.credits && (
                    <div className="credits">
                        Credits: {tournament.credits}
                    </div>
                )}
            </div>
            
            <h2>Rounds</h2>
            {tournament.rounds && tournament.rounds.length > 0 ? (
                <div className="rounds-list">
                    {tournament.rounds.map(round => (
                        <div key={round.id} className="round-card">
                            <h3>{round.name}</h3>
                            {round.ongoing ? (
                                <span className="live-badge">LIVE</span>
                            ) : round.finished ? (
                                <span className="finished-badge">Finished</span>
                            ) : (
                                <div className="starts-at">
                                    Starts: {new Date(round.startsAt).toLocaleString()}
                                </div>
                            )}
                            <a href={`/broadcast/${tournament.slug}/${tournament.id}/${round.slug}/${round.id}`} className="view-round">
                                {round.ongoing ? 'Watch Now' : round.finished ? 'View Round' : 'Details'}
                            </a>
                        </div>
                    ))}
                </div>
            ) : (
                <p>No rounds available.</p>
            )}
        </div>
    );
}
```

### `useBroadcastRound`

Fetches data and PGN content for a specific broadcast round.

**Parameters:**
- `roundId`: ID of the round to fetch (or null if not specified)

**Returns:**
- `round`: Round data object (may be null if only PGN data is available)
- `pgn`: PGN content for the round
- `loading`: Boolean indicating if round data is being fetched
- `error`: Error object if the fetch failed, otherwise null
- `refresh`: Function to manually refresh the round data

**Example:**
```jsx
import { useBroadcastRound } from '@/lib/lichess/hooks';
import { useRouter } from 'next/router';
import { useState } from 'react';

function BroadcastRoundViewer() {
    const router = useRouter();
    const { roundId } = router.query;
    const [selectedGameIndex, setSelectedGameIndex] = useState(0);
    
    const { pgn, loading, error, refresh } = useBroadcastRound(roundId);
    
    // Simple PGN parser (this would be more complex in a real app)
    const games = pgn ? pgn.split('\n\n[Event').map((g, i) => 
        i === 0 ? g : '[Event' + g) : [];
    
    if (loading) return <div>Loading broadcast round...</div>;
    if (error) return <div>Error: {error.message}</div>;
    if (!pgn) return <div>No game data available</div>;
    
    return (
        <div className="broadcast-round-viewer">
            <div className="controls">
                <button onClick={refresh}>Refresh Games</button>
            </div>
            
            <div className="games-selector">
                <h3>Games</h3>
                <select 
                    value={selectedGameIndex}
                    onChange={(e) => setSelectedGameIndex(Number(e.target.value))}
                >
                    {games.map((_, i) => (
                        <option key={i} value={i}>Game {i + 1}</option>
                    ))}
                </select>
            </div>
            
            <div className="pgn-viewer">
                {/* In a real app, you would use a chess board component here */}
                <ChessBoard pgn={games[selectedGameIndex]} />
            </div>
        </div>
    );
}
```

### `useBroadcastActions`

Provides functions for managing broadcast actions such as creating, updating, and pushing PGN data.

**Returns:**
- `loading`: Boolean indicating if an action is in progress
- `error`: Error object if the action failed, otherwise null
- `createTournament`: Function to create a new broadcast tournament
- `createRound`: Function to create a new broadcast round
- `updateTournament`: Function to update a broadcast tournament
- `updateRound`: Function to update a broadcast round
- `pushPgn`: Function to push PGN data to a broadcast round
- `resetRound`: Function to reset a broadcast round

**Example:**
```jsx
import { useBroadcastActions } from '@/lib/lichess/hooks';
import { useState } from 'react';

function BroadcastCreator() {
    const [formData, setFormData] = useState({
        name: '',
        description: ''
    });
    const [created, setCreated] = useState(null);
    
    const { loading, error, createTournament } = useBroadcastActions();
    
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const tournament = await createTournament(formData);
            setCreated(tournament);
            setFormData({ name: '', description: '' });
        } catch (err) {
            console.error('Failed to create tournament:', err);
        }
    };
    
    return (
        <div className="broadcast-creator">
            <h2>Create New Broadcast</h2>
            
            {error && <div className="error">{error.message}</div>}
            
            {created ? (
                <div className="success">
                    <p>Broadcast created successfully!</p>
                    <a href={`/broadcast/${created.slug}/${created.id}`}>
                        View Broadcast: {created.name}
                    </a>
                </div>
            ) : (
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="name">Tournament Name</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="description">Description</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={4}
                        />
                    </div>
                    
                    <button type="submit" disabled={loading}>
                        {loading ? 'Creating...' : 'Create Broadcast'}
                    </button>
                </form>
            )}
        </div>
    );
}
```

### `useMyBroadcastRounds`

Fetches broadcast rounds created by the authenticated user.

**Returns:**
- `rounds`: Array of round data objects
- `loading`: Boolean indicating if rounds are being fetched
- `error`: Error object if the fetch failed, otherwise null
- `refresh`: Function to manually refresh the rounds

**Example:**
```jsx
import { useMyBroadcastRounds, useBroadcastActions } from '@/lib/lichess/hooks';
import { useAuth } from '@/lib/lichess/hooks';

function MyBroadcastsManager() {
    const { isAuthenticated, login } = useAuth();
    const { rounds, loading, error, refresh } = useMyBroadcastRounds();
    const { pushPgn, resetRound } = useBroadcastActions();
    
    if (!isAuthenticated) {
        return (
            <div>
                <p>Please log in to manage your broadcasts</p>
                <button onClick={login}>Login with Lichess</button>
            </div>
        );
    }
    
    if (loading) return <div>Loading your broadcasts...</div>;
    if (error) return <div>Error: {error.message}</div>;
    if (!rounds || rounds.length === 0) return <div>You don't have any broadcast rounds yet.</div>;
    
    const handlePushPgn = async (roundId, pgn) => {
        try {
            await pushPgn(roundId, pgn);
            refresh(); // Refresh the list after pushing PGN
        } catch (err) {
            console.error('Failed to push PGN:', err);
        }
    };
    
    const handleResetRound = async (roundId) => {
        if (!confirm('Are you sure you want to reset this round? All progress will be lost.')) {
            return;
        }
        
        try {
            await resetRound(roundId);
            refresh(); // Refresh the list after reset
        } catch (err) {
            console.error('Failed to reset round:', err);
        }
    };
    
    return (
        <div className="my-broadcasts">
            <h2>My Broadcast Rounds</h2>
            <button onClick={refresh}>Refresh</button>
            
            <div className="rounds-list">
                {rounds.map(round => (
                    <div key={round.id} className="round-item">
                        <div className="round-info">
                            <h3>{round.name}</h3>
                            <p>{round.description}</p>
                            <div className="round-meta">
                                <span>Status: {round.ongoing ? 'Live' : round.finished ? 'Finished' : 'Upcoming'}</span>
                                <span>Tournament: {round.tour.name}</span>
                            </div>
                        </div>
                        
                        <div className="round-actions">
                            <button 
                                onClick={() => handlePushPgn(round.id, prompt('Enter PGN to push:'))}
                                disabled={round.finished}
                            >
                                Push PGN
                            </button>
                            
                            <button 
                                onClick={() => handleResetRound(round.id)}
                                className="danger"
                                disabled={round.finished}
                            >
                                Reset Round
                            </button>
                            
                            <a 
                                href={`/broadcast/${round.tour.slug}/${round.tour.id}/${round.slug}/${round.id}`}
                                target="_blank" 
                                rel="noopener noreferrer"
                            >
                                View
                            </a>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
```

## Best Practices

- **Error Handling:** Always check the error value and display appropriate messages to users.
- **Loading States:** Use the loading state to show loading indicators during data fetching.
- **Authentication Awareness:** Remember that broadcast creation and management requires authentication. Use the `useAuth` hook to check authentication status.
- **Refresh Data:** Use the refresh functions provided by the hooks to update data when needed, especially after performing actions that modify the data.
- **Pagination:** For hooks that support pagination, implement proper pagination controls in your UI.
- **Rate Limiting:** Be aware of Lichess API rate limits. Avoid excessive refreshing of broadcast data.
- **Data Caching:** Consider implementing client-side caching for broadcast data that doesn't change frequently.
