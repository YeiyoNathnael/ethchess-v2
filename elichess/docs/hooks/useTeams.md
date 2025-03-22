# useTeams Hooks

The `useTeams` hooks provide React components with convenient ways to interact with Lichess teams functionality. Teams are groups of chess players that can participate in team tournaments, share discussions, and build a community.

## Overview

These hooks simplify common team-related operations such as:
- Fetching team information
- Viewing teams a user belongs to
- Managing team membership
- Handling join requests
- Retrieving team members

## Available Hooks

### `useTeam`

Fetches information about a specific team.

**Parameters:**
- `teamId`: ID of the team to fetch (string or null)

**Returns:**
- `team`: Team data object or null if not loaded
- `loading`: Boolean indicating if the team is being fetched
- `error`: Error object if the fetch failed, otherwise null
- `refresh`: Function to manually refresh the team data

**Example:**
```jsx
import { useTeam } from '@/lib/lichess/hooks';

function TeamDetails({ teamId }) {
    const { team, loading, error } = useTeam(teamId);

    if (loading) return <div>Loading team...</div>;
    if (error) return <div>Error: {error.message}</div>;
    if (!team) return <div>Team not found</div>;

    return (
        <div className="team-profile">
            <h1>{team.name}</h1>
            <div className="team-description">{team.description}</div>
            <div className="team-stats">
                <div>Members: {team.nbMembers}</div>
                <div>Leader: {team.leader.name}</div>
            </div>
        </div>
    );
}
```

### `useUserTeams`

Fetches teams that a user belongs to.

**Parameters:**
- `username`: (Optional) Username to fetch teams for. If not provided and the user is authenticated, it uses the current user.

**Returns:**
- `teams`: Array of team objects
- `loading`: Boolean indicating if teams are being fetched
- `error`: Error object if the fetch failed, otherwise null
- `refresh`: Function to manually refresh the teams data

**Example:**
```jsx
import { useUserTeams } from '@/lib/lichess/hooks';

function UserTeamsList({ username }) {
    const { teams, loading, error } = useUserTeams(username);

    if (loading) return <div>Loading teams...</div>;
    if (error) return <div>Error: {error.message}</div>;

    return (
        <div className="user-teams">
            <h2>{username ? `${username}'s Teams` : 'My Teams'}</h2>
            {teams.length > 0 ? (
                <ul className="teams-list">
                    {teams.map(team => (
                        <li key={team.id}>
                            <a href={`/team/${team.id}`}>{team.name}</a>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No teams found</p>
            )}
        </div>
    );
}
```

### `useTeamMembers`

Fetches the members of a specific team.

**Parameters:**
- `teamId`: ID of the team to fetch members for (string or null)

**Returns:**
- `members`: Array of team member objects
- `loading`: Boolean indicating if members are being fetched
- `error`: Error object if the fetch failed, otherwise null
- `refresh`: Function to manually refresh the members data

**Example:**
```jsx
import { useTeamMembers } from '@/lib/lichess/hooks';

function TeamMembersList({ teamId }) {
    const { members, loading, error } = useTeamMembers(teamId);

    if (loading) return <div>Loading members...</div>;
    if (error) return <div>Error: {error.message}</div>;

    return (
        <div className="team-members">
            <h2>Team Members ({members.length})</h2>
            <ul className="members-list">
                {members.map(member => (
                    <li key={member.user.id}>
                        <a href={`/@/${member.user.name}`}>
                            {member.user.title && <span className="title">{member.user.title}</span>}
                            {member.user.name}
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    );
}
```

### `useTeamActions`

Provides functions for performing team actions like joining or leaving teams.

**Returns:**
- `loading`: Boolean indicating if an action is in progress
- `error`: Error object if the last action failed, otherwise null
- `joinTeam`: Function to join a team
- `leaveTeam`: Function to leave a team
- `kickMember`: Function to kick a member from a team (requires appropriate permissions)

**Example:**
```jsx
import { useTeamActions } from '@/lib/lichess/hooks';
import { useState } from 'react';

function TeamJoiner({ teamId, hasPassword }) {
    const { joinTeam, loading, error } = useTeamActions();
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [success, setSuccess] = useState(false);

    const handleJoin = async (e) => {
        e.preventDefault();
        try {
            await joinTeam(teamId, password, message);
            setSuccess(true);
        } catch (err) {
            console.error('Failed to join team:', err);
        }
    };

    if (success) return <div>Successfully joined the team!</div>;

    return (
        <form onSubmit={handleJoin} className="join-team-form">
            {error && <div className="error">{error.message}</div>}
            
            {hasPassword && (
                <div className="form-group">
                    <label>Password:</label>
                    <input 
                        type="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        required={hasPassword}
                    />
                </div>
            )}
            
            <div className="form-group">
                <label>Message (optional):</label>
                <textarea 
                    value={message} 
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Why do you want to join this team?"
                    rows={3}
                />
            </div>
            
            <button type="submit" disabled={loading}>
                {loading ? 'Joining...' : 'Join Team'}
            </button>
        </form>
    );
}
```

### `useTeamJoinRequests`

Manages and retrieves team join requests.

**Parameters:**
- `teamId`: ID of the team to fetch join requests for (string or null)

**Returns:**
- `requests`: Array of join request objects
- `loading`: Boolean indicating if requests are being fetched
- `error`: Error object if the fetch failed, otherwise null
- `refresh`: Function to manually refresh the requests data
- `acceptRequest`: Function to accept a join request
- `declineRequest`: Function to decline a join request

**Example:**
```jsx
import { useTeamJoinRequests } from '@/lib/lichess/hooks';

function TeamRequestsManager({ teamId }) {
    const { 
        requests, 
        loading, 
        error, 
        acceptRequest, 
        declineRequest 
    } = useTeamJoinRequests(teamId);

    if (loading) return <div>Loading requests...</div>;
    if (error) return <div>Error: {error.message}</div>;

    return (
        <div className="join-requests">
            <h2>Join Requests ({requests.length})</h2>
            
            {requests.length > 0 ? (
                <ul className="requests-list">
                    {requests.map(request => (
                        <li key={request.user.id} className="request-item">
                            <div className="user-info">
                                <a href={`/@/${request.user.name}`}>{request.user.name}</a>
                                <span className="rating">Rating: {request.user.rating}</span>
                            </div>
                            
                            {request.message && (
                                <div className="request-message">
                                    "{request.message}"
                                </div>
                            )}
                            
                            <div className="request-actions">
                                <button 
                                    onClick={() => acceptRequest(request.user.id)}
                                    className="accept-button"
                                >
                                    Accept
                                </button>
                                <button 
                                    onClick={() => declineRequest(request.user.id)}
                                    className="decline-button"
                                >
                                    Decline
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No pending join requests</p>
            )}
        </div>
    );
}
```

## Common Use Cases

### Team Dashboard

```jsx
import { useTeam, useTeamMembers, useTeamActions, useAuth } from '@/lib/lichess/hooks';

function TeamDashboard({ teamId }) {
    const { team, loading: teamLoading } = useTeam(teamId);
    const { members, loading: membersLoading } = useTeamMembers(teamId);
    const { leaveTeam } = useTeamActions();
    const { session } = useAuth();
    
    const handleLeave = async () => {
        if (confirm('Are you sure you want to leave this team?')) {
            try {
                await leaveTeam(teamId);
                alert('You have left the team');
                // Redirect or update UI
            } catch (err) {
                alert(`Error: ${err.message}`);
            }
        }
    };
    
    const isTeamMember = members.some(
        member => member.user.id === session?.user?.id
    );
    
    return (
        <div className="team-dashboard">
            {/* Team info */}
            {/* Members list */}
            {isTeamMember && (
                <button onClick={handleLeave} className="leave-team">
                    Leave Team
                </button>
            )}
        </div>
    );
}
```

### Team Switcher

```jsx
import { useUserTeams } from '@/lib/lichess/hooks';

function TeamSwitcher() {
    const { teams } = useUserTeams();
    
    return (
        <div className="team-switcher">
            <label htmlFor="team-select">My Teams:</label>
            <select id="team-select">
                <option value="">Select a team</option>
                {teams.map(team => (
                    <option key={team.id} value={team.id}>
                        {team.name}
                    </option>
                ))}
            </select>
        </div>
    );
}
```

## Data Structures

### Team Object

The team object typically includes:
```typescript
interface Team {
    id: string;             // Team ID
    name: string;           // Team name
    description: string;    // Team description
    leader: {               // Team leader
        id: string;
        name: string;
    };
    nbMembers: number;      // Number of members
    location?: string;      // Team location
    open: boolean;          // Whether the team is open to join
    createdAt: number;      // Creation timestamp
    enabled: boolean;       // Team status
    admin?: boolean;        // Whether current user is admin (authenticated only)
    isFollowing?: boolean;  // Whether current user follows the team
}
```

### Team Member Object

The team member object typically includes:
```typescript
interface TeamMember {
    user: {
        id: string;           // User ID
        name: string;         // Username
        title?: string;       // Chess title (GM, IM, etc.)
        online: boolean;      // Whether user is online
    };
    joined: number;         // Join timestamp
    role?: string;          // Role in the team
}
```

### Join Request Object

The join request object typically includes:
```typescript
interface JoinRequest {
    user: {
        id: string;           // User ID
        name: string;         // Username
        title?: string;       // Chess title
        rating: number;       // User rating
    };
    message?: string;       // Join request message
    date: number;           // Request timestamp
}
```

## Best Practices

- **Authentication Awareness**: Most team management actions require authentication. Use the `useAuth` hook to check authentication status.
- **Error Handling**: Always implement proper error handling, especially for team actions that may fail.
- **Optimistic Updates**: Consider implementing optimistic UI updates for actions like accepting/declining requests to improve perceived performance.
- **Permission Checking**: Check for admin status before showing admin-only UI elements like kick buttons or join request management.
- **Rate Limiting**: Be aware of Lichess API rate limits; avoid making excessive requests in rapid succession.