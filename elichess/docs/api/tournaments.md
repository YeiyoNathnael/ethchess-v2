# Tournaments API

The Tournaments API provides functions for interacting with Lichess tournaments, allowing you to create, join, leave, and fetch information about tournaments.

## Overview

Lichess hosts hundreds of tournaments daily. This API module enables you to:

- Create custom tournaments
- Fetch upcoming and ongoing tournaments
- Join or withdraw from tournaments
- View tournaments you're participating in

## Functions

### Tournament Creation

#### `createTournament(options)`

Creates a new tournament on Lichess.

**Authentication Required**: Yes (requires 'tournament:write' scope)

**Parameters:**
- `options`: Tournament creation options
    - `name`: Tournament name
    - `clockTime`: Clock time in minutes
    - `clockIncrement`: Clock increment in seconds
    - `minutes`: Tournament duration in minutes
    - `waitMinutes`: Minutes until the tournament starts
    - `variant`: (Optional) Game variant (defaults to 'standard')
    - `description`: (Optional) Tournament description
    - `berserkable`: (Optional) Whether players can use berserk mode
    - `password`: (Optional) Password to restrict entry
    - `minRating`: (Optional) Minimum rating to join
    - `maxRating`: (Optional) Maximum rating to join
    - `teamId`: (Optional) Team ID for team tournaments

**Returns:**
A Promise that resolves to the tournament data or throws an error.

**Example:**
```typescript
import { createTournament } from '@/lib/lichess/api';

// Create a 3+2 blitz tournament starting in 30 minutes and lasting 60 minutes
try {
    const tournament = await createTournament({
        name: 'My Awesome Tournament',
        clockTime: 3,
        clockIncrement: 2,
        minutes: 60,
        waitMinutes: 30,
        description: 'A friendly blitz tournament for everyone!',
        berserkable: true
    });
    
    console.log(`Tournament created! URL: ${tournament.url}`);
    console.log(`Tournament ID: ${tournament.id}`);
} catch (error) {
    console.error('Failed to create tournament:', error);
}
```

### Tournament Listing

#### `fetchTournaments()`

Fetches upcoming and ongoing tournaments.

**Authentication Required**: No

**Returns**: A Promise that resolves to an array of tournament objects or an empty array on error.

**Example:**
```typescript
import { fetchTournaments } from '@/lib/lichess/api';

// Get upcoming and ongoing tournaments
const tournaments = await fetchTournaments();

console.log(`Found ${tournaments.length} tournaments`);

// Display upcoming tournaments
const upcoming = tournaments.filter(t => t.status === 'created');
console.log(`${upcoming.length} tournaments starting soon:`);

upcoming.forEach(tournament => {
    const startsIn = new Date(tournament.startsAt) - new Date();
    const minutesUntilStart = Math.floor(startsIn / 60000);
    
    console.log(`${tournament.fullName} - Starts in ${minutesUntilStart} minutes`);
    console.log(`Time control: ${tournament.clock.limit / 60}+${tournament.clock.increment}`);
    console.log(`Participants: ${tournament.nbPlayers}`);
});
```

### Fetch My Tournaments

#### `fetchMyTournaments()`

Fetches tournaments the authenticated user is participating in.

**Authentication Required**: Yes

**Returns**: A Promise that resolves to an array of tournament objects or an empty array if not authenticated or on error.

**Example:**
```typescript
import { fetchMyTournaments } from '@/lib/lichess/api';

// Get tournaments the user is participating in
const myTournaments = await fetchMyTournaments();

if (myTournaments.length === 0) {
    console.log('You are not participating in any tournaments');
} else {
    console.log(`You are participating in ${myTournaments.length} tournaments:`);
    
    myTournaments.forEach(tournament => {
        console.log(`${tournament.fullName}`);
        if (tournament.status === 'started') {
            console.log('This tournament is currently running!');
        } else {
            const startsIn = new Date(tournament.startsAt) - new Date();
            const minutesUntilStart = Math.floor(startsIn / 60000);
            console.log(`Starts in ${minutesUntilStart} minutes`);
        }
    });
}
```

### Tournament Participation

#### `joinTournament(tournamentId, password?)`

Joins a tournament.

**Authentication Required**: Yes (requires 'tournament:write' scope)

**Parameters:**
- `tournamentId`: ID of the tournament to join
- `password`: (Optional) Password for private tournaments

**Returns**: A Promise that resolves to a boolean indicating success.

**Example:**
```typescript
import { joinTournament } from '@/lib/lichess/api';

// Join a public tournament
try {
    const success = await joinTournament('abc123def456');
    
    if (success) {
        console.log('Successfully joined the tournament!');
    } else {
        console.log('Failed to join tournament');
    }
} catch (error) {
    console.error('Error:', error);
}

// Join a private tournament with password
try {
    const success = await joinTournament('private123', 'secretpassword');
    
    if (success) {
        console.log('Successfully joined the private tournament!');
    } else {
        console.log('Failed to join tournament. Incorrect password?');
    }
} catch (error) {
    console.error('Error:', error);
}
```

#### `withdrawFromTournament(tournamentId)`

Withdraws from a tournament.

**Authentication Required**: Yes (requires 'tournament:write' scope)

**Parameters:**
- `tournamentId`: ID of the tournament to withdraw from

**Returns**: A Promise that resolves to a boolean indicating success.

**Example:**
```typescript
import { withdrawFromTournament } from '@/lib/lichess/api';

// Withdraw from a tournament
try {
    const success = await withdrawFromTournament('abc123def456');
    
    if (success) {
        console.log('Successfully withdrew from the tournament');
    } else {
        console.log('Failed to withdraw from tournament');
    }
} catch (error) {
    console.error('Error:', error);
}
```

## Types

### `CreateTournamentOptions`

Options for creating a tournament.

```typescript
interface CreateTournamentOptions {
    /** Tournament name */
    name: string;
    /** Clock time in minutes */
    clockTime: number;
    /** Clock increment in seconds */
    clockIncrement: number;
    /** Tournament duration in minutes */
    minutes: number;
    /** Minutes until the tournament starts */
    waitMinutes: number;
    /** Game variant */
    variant?: LichessVariantKey;
    /** Tournament description */
    description?: string;
    /** Whether players can use berserk mode */
    berserkable?: boolean;
    /** Password to restrict entry (if any) */
    password?: string;
    /** Minimum rating to join */
    minRating?: number;
    /** Maximum rating to join */
    maxRating?: number;
    /** Team ID for team tournaments */
    teamId?: string;
}
```

### `LichessTournament`

Represents a Lichess tournament. This type is imported from the library's types module and includes properties like:

- `id`: The tournament ID
- `fullName`: Tournament full name
- `clock`: Object containing time control information
- `minutes`: Tournament duration
- `startsAt`: Tournament start time (timestamp)
- `status`: Tournament status ('created', 'started', 'finished')
- `variant`: Game variant
- `nbPlayers`: Number of participants
- And many other properties

## Common Use Cases

### Tournament Browser Component

```typescript
import { fetchTournaments } from '@/lib/lichess/api';
import { useState, useEffect } from 'react';

function TournamentBrowser() {
    const [tournaments, setTournaments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('all'); // 'all', 'upcoming', 'ongoing'
    
    useEffect(() => {
        async function loadTournaments() {
            try {
                setLoading(true);
                const data = await fetchTournaments();
                setTournaments(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        
        loadTournaments();
        
        // Refresh tournaments every 2 minutes
        const intervalId = setInterval(loadTournaments, 120000);
        return () => clearInterval(intervalId);
    }, []);
    
    // Filter tournaments based on status
    const filteredTournaments = tournaments.filter(tournament => {
        if (filter === 'all') return true;
        if (filter === 'upcoming') return tournament.status === 'created';
        if (filter === 'ongoing') return tournament.status === 'started';
        return true;
    });
    
    // Sort tournaments by start time
    const sortedTournaments = [...filteredTournaments].sort((a, b) => {
        return a.startsAt - b.startsAt;
    });
    
    if (loading && tournaments.length === 0) return <div>Loading tournaments...</div>;
    if (error) return <div>Error: {error}</div>;
    
    return (
        <div className="tournament-browser">
            <h2>Lichess Tournaments</h2>
            
            <div className="filters">
                <button 
                    className={filter === 'all' ? 'active' : ''} 
                    onClick={() => setFilter('all')}
                >
                    All
                </button>
                <button 
                    className={filter === 'upcoming' ? 'active' : ''} 
                    onClick={() => setFilter('upcoming')}
                >
                    Upcoming
                </button>
                <button 
                    className={filter === 'ongoing' ? 'active' : ''} 
                    onClick={() => setFilter('ongoing')}
                >
                    Ongoing
                </button>
            </div>
            
            {sortedTournaments.length > 0 ? (
                <div className="tournaments-list">
                    {sortedTournaments.map(tournament => (
                        <div key={tournament.id} className="tournament-card">
                            <div className="tournament-title">
                                <h3>{tournament.fullName}</h3>
                                <span className={`status ${tournament.status}`}>
                                    {tournament.status === 'created' ? 'Upcoming' : 
                                     tournament.status === 'started' ? 'Ongoing' : 'Finished'}
                                </span>
                            </div>
                            
                            <div className="tournament-details">
                                <div className="time-control">
                                    <span>{tournament.clock.limit / 60}+{tournament.clock.increment}</span>
                                    <span>{tournament.variant !== 'standard' ? tournament.variant : 'Standard'}</span>
                                </div>
                                
                                <div className="duration">
                                    <span>Duration: {tournament.minutes} min</span>
                                </div>
                                
                                <div className="participants">
                                    <span>{tournament.nbPlayers} players</span>
                                </div>
                            </div>
                            
                            <div className="tournament-timing">
                                {tournament.status === 'created' ? (
                                    <div className="starts-in">
                                        Starts in: {formatTimeUntil(tournament.startsAt)}
                                    </div>
                                ) : tournament.status === 'started' ? (
                                    <div className="ends-in">
                                        Ends in: {formatTimeUntil(tournament.finishesAt)}
                                    </div>
                                ) : (
                                    <div className="finished-at">
                                        Finished: {formatDateTime(tournament.finishesAt)}
                                    </div>
                                )}
                            </div>
                            
                            <div className="tournament-actions">
                                <a 
                                    href={`https://lichess.org/tournament/${tournament.id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="view-button"
                                >
                                    View on Lichess
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p>No tournaments found</p>
            )}
        </div>
    );
}

// Helper function to format time until a timestamp
function formatTimeUntil(timestamp) {
    const now = new Date();
    const target = new Date(timestamp);
    const diff = target.getTime() - now.getTime();
    
    if (diff <= 0) return 'Now';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
}

// Helper function to format date and time
function formatDateTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString();
}
```
```typescript
import { fetchTournaments } from '@/lib/lichess/api';
import { useState, useEffect } from 'react';

function TournamentBrowser() {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'upcoming', 'ongoing'
  
  useEffect(() => {
    async function loadTournaments() {
      try {
        setLoading(true);
        const data = await fetchTournaments();
        setTournaments(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    loadTournaments();
    
    // Refresh tournaments every 2 minutes
    const intervalId = setInterval(loadTournaments, 120000);
    return () => clearInterval(intervalId);
  }, []);
  
  // Filter tournaments based on status
  const filteredTournaments = tournaments.filter(tournament => {
    if (filter === 'all') return true;
    if (filter === 'upcoming') return tournament.status === 'created';
    if (filter === 'ongoing') return tournament.status === 'started';
    return true;
  });
  
  // Sort tournaments by start time
  const sortedTournaments = [...filteredTournaments].sort((a, b) => {
    return a.startsAt - b.startsAt;
  });
  
  if (loading && tournaments.length === 0) return <div>Loading tournaments...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div className="tournament-browser">
      <h2>Lichess Tournaments</h2>
      
      <div className="filters">
        <button 
          className={filter === 'all' ? 'active' : ''} 
          onClick={() => setFilter('all')}
        >
          All
        </button>
        <button 
          className={filter === 'upcoming' ? 'active' : ''} 
          onClick={() => setFilter('upcoming')}
        >
          Upcoming
        </button>
        <button 
          className={filter === 'ongoing' ? 'active' : ''} 
          onClick={() => setFilter('ongoing')}
        >
          Ongoing
        </button>
      </div>
      
      {sortedTournaments.length > 0 ? (
        <div className="tournaments-list">
          {sortedTournaments.map(tournament => (
            <div key={tournament.id} className="tournament-card">
              <div className="tournament-title">
                <h3>{tournament.fullName}</h3>
                <span className={`status ${tournament.status}`}>
                  {tournament.status === 'created' ? 'Upcoming' : 
                   tournament.status === 'started' ? 'Ongoing' : 'Finished'}
                </span>
              </div>
              
              <div className="tournament-details">
                <div className="time-control">
                  <span>{tournament.clock.limit / 60}+{tournament.clock.increment}</span>
                  <span>{tournament.variant !== 'standard' ? tournament.variant : 'Standard'}</span>
                </div>
                
                <div className="duration">
                  <span>Duration: {tournament.minutes} min</span>
                </div>
                
                <div className="participants">
                  <span>{tournament.nbPlayers} players</span>
                </div>
              </div>
              
              <div className="tournament-timing">
                {tournament.status === 'created' ? (
                  <div className="starts-in">
                    Starts in: {formatTimeUntil(tournament.startsAt)}
                  </div>
                ) : tournament.status === 'started' ? (
                  <div className="ends-in">
                    Ends in: {formatTimeUntil(tournament.finishesAt)}
                  </div>
                ) : (
                  <div className="finished-at">
                    Finished: {formatDateTime(tournament.finishesAt)}
                  </div>
                )}
              </div>
              
              <div className="tournament-actions">
                <a 
                  href={`https://lichess.org/tournament/${tournament.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="view-button"
                >
                  View on Lichess
                </a>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>No tournaments found</p>
      )}
    </div>
  );
}

// Helper function to format time until a timestamp
function formatTimeUntil(timestamp) {
  const now = new Date();
  const target = new Date(timestamp);
  const diff = target.getTime() - now.getTime();
  
  if (diff <= 0) return 'Now';
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
}

// Helper function to format date and time
function formatDateTime(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleString();
}
```
### Tournament Creation Form
```typescript
import { createTournament } from '@/lib/lichess/api';
import { useAuth } from '@/lib/lichess/hooks';
import { useState } from 'react';

function TournamentCreator() {
  const { isAuthenticated, login } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    clockTime: 3,
    clockIncrement: 0,
    minutes: 45,
    waitMinutes: 5,
    variant: 'standard',
    description: '',
    berserkable: true,
    password: '',
    minRating: '',
    maxRating: '',
    teamId: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      login();
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      // Convert string values to numbers where needed
      const options = {
        ...formData,
        clockTime: Number(formData.clockTime),
        clockIncrement: Number(formData.clockIncrement),
        minutes: Number(formData.minutes),
        waitMinutes: Number(formData.waitMinutes),
        minRating: formData.minRating ? Number(formData.minRating) : undefined,
        maxRating: formData.maxRating ? Number(formData.maxRating) : undefined
      };
      
      // Remove empty strings for optional fields
      if (!options.description) delete options.description;
      if (!options.password) delete options.password;
      if (!options.teamId) delete options.teamId;
      
      const result = await createTournament(options);
      
      setSuccess({
        message: 'Tournament created successfully!',
        id: result.id,
        url: result.url
      });
      
      // Reset form
      setFormData({
        name: '',
        clockTime: 3,
        clockIncrement: 0,
        minutes: 45,
        waitMinutes: 5,
        variant: 'standard',
        description: '',
        berserkable: true,
        password: '',
        minRating: '',
        maxRating: '',
        teamId: ''
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  if (!isAuthenticated) {
    return (
      <div className="tournament-creator">
        <h2>Create Tournament</h2>
        <p>Please log in to create a tournament</p>
        <button onClick={login}>Login with Lichess</button>
      </div>
    );
  }
  
  return (
    <div className="tournament-creator">
      <h2>Create Tournament</h2>
      
      {error && <div className="error">{error}</div>}
      
      {success && (
        <div className="success">
          <p>{success.message}</p>
          <a 
            href={success.url} 
            target="_blank" 
            rel="noopener noreferrer"
          >
            View Tournament
          </a>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Tournament Name *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            maxLength={30}
          />
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="clockTime">Clock Time (minutes) *</label>
            <input
              type="number"
              id="clockTime"
              name="clockTime"
              value={formData.clockTime}
              onChange={handleChange}
              required
              min={0}
              max={180}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="clockIncrement">Increment (seconds) *</label>
            <input
              type="number"
              id="clockIncrement"
              name="clockIncrement"
              value={formData.clockIncrement}
              onChange={handleChange}
              required
              min={0}
              max={180}
            />
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="minutes">Duration (minutes) *</label>
            <input
              type="number"
              id="minutes"
              name="minutes"
              value={formData.minutes}
              onChange={handleChange}
              required
              min={5}
              max={540}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="waitMinutes">Start Delay (minutes) *</label>
            <input
              type="number"
              id="waitMinutes"
              name="waitMinutes"
              value={formData.waitMinutes}
              onChange={handleChange}
              required
              min={1}
              max={60}
            />
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="variant">Variant</label>
          <select
            id="variant"
            name="variant"
            value={formData.variant}
            onChange={handleChange}
          >
            <option value="standard">Standard</option>
            <option value="chess960">Chess960</option>
            <option value="crazyhouse">Crazyhouse</option>
            <option value="antichess">Antichess</option>
            <option value="atomic">Atomic</option>
            <option value="horde">Horde</option>
            <option value="kingOfTheHill">King of the Hill</option>
            <option value="racingKings">Racing Kings</option>
            <option value="threeCheck">Three-check</option>
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            maxLength={400}
          />
        </div>
        
        <div className="form-group checkbox">
          <input
            type="checkbox"
            id="berserkable"
            name="berserkable"
            checked={formData.berserkable}
            onChange={handleChange}
          />
          <label htmlFor="berserkable">Allow Berserk</label>
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Password (optional)</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
          />
          <small>Leave empty for public tournament</small>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="minRating">Minimum Rating (optional)</label>
            <input
              type="number"
              id="minRating"
              name="minRating"
              value={formData.minRating}
              onChange={handleChange}
              min={800}
              max={2900}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="maxRating">Maximum Rating (optional)</label>
            <input
              type="number"
              id="maxRating"
              name="maxRating"
              value={formData.maxRating}
              onChange={handleChange}
              min={800}
              max={2900}
            />
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="teamId">Team ID (optional)</label>
          <input
            type="text"
            id="teamId"
            name="teamId"
            value={formData.teamId}
            onChange={handleChange}
          />
          <small>For team-restricted tournaments</small>
        </div>
        
        <button 
          type="submit" 
          disabled={loading || !formData.name}
          className="create-button"
        >
          {loading ? 'Creating...' : 'Create Tournament'}
        </button>
      </form>
    </div>
  );
}
```