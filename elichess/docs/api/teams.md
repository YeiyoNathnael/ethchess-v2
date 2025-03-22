# Teams API

The Teams API provides functions for working with Lichess teams. This includes retrieving team information, searching for teams, managing team membership, handling join requests, and communicating with team members.

## Overview

Lichess teams are groups of players that can participate in team tournaments and battles. Teams can be public or private, and may require approval to join. This API module enables:

- Getting information about teams
- Searching for teams
- Managing team membership
- Handling join requests
- Team administration tasks

## Functions

### Team Information

#### `getTeam(teamId)`

Gets information about a specific team.

**Parameters:**
- `teamId`: The ID of the team to fetch

**Returns:**
A Promise that resolves to the team data object or `null` on error.

**Example:**
```typescript
import { getTeam } from '@/lib/lichess/api';

// Get information about a team
const team = await getTeam('lichess-swiss');

if (team) {
  console.log(`Team: ${team.name}`);
  console.log(`Description: ${team.description}`);
  console.log(`Members: ${team.nbMembers}`);
}
```
### Team Search

#### `searchTeams(query, page?)`

Searches for teams by keyword.

**Parameters:**
- `query`: Search term
- `page`: (Optional) Page number (1-indexed), defaults to 1

**Returns:**
A Promise that resolves to a paginated list of teams or `null` on error.

**Example:**
```typescript
import { searchTeams } from '@/lib/lichess/api';

// Search for chess teams
const results = await searchTeams('chess', 1);

if (results) {
    console.log(`Found ${results.nbResults} teams in total`);
    console.log(`Page ${results.page} of ${results.nbPages}`);
    
    results.currentPageResults.forEach(team => {
        console.log(`${team.name} (${team.id}) - ${team.nbMembers} members`);
    });
}
```

### User Teams

#### `getUserTeams(username)`

Gets all teams a player belongs to.

**Parameters:**
- `username`: The username to get teams for

**Returns:**
A Promise that resolves to a list of teams or `null` on error.

**Example:**
```typescript
import { getUserTeams } from '@/lib/lichess/api';

// Get teams a player belongs to
const teams = await getUserTeams('MagnusCarlsen');

if (teams) {searchTeams(query, page?)
Searches for teams by keyword.

Parameters:

query: Search term
page: (Optional) Page number (1-indexed), defaults to 1
Returns: A Promise that resolves to a paginated list of teams or null on error.

Example:
import { searchTeams } from '@/lib/lichess/api';

// Search for chess teams
const results = await searchTeams('chess', 1);

if (results) {
  console.log(`Found ${results.nbResults} teams in total`);
  console.log(`Page ${results.page} of ${results.nbPages}`);
  
  results.currentPageResults.forEach(team => {
    console.log(`${team.name} (${team.id}) - ${team.nbMembers} members`);
  });
}
getUserTeams(username)
Gets all teams a player belongs to.

Parameters:

username: The username to get teams for
Returns: A Promise that resolves to a list of teams or null on error.

Example:
import { getUserTeams } from '@/lib/lichess/api';

// Get teams a player belongs to
const teams = await getUserTeams('MagnusCarlsen');

if (teams) {
  console.log(`${teams.length} teams found`);
  teams.forEach(team => {
    console.log(`${team.name} (${team.id})`);
  });
}
Team Members
getTeamMembers(teamId)
Gets members of a team.

Authentication Required: Yes (for private teams)

Parameters:

teamId: The ID of the team
Returns: A Promise that resolves to an array of team members or null on error.

Example:

import { getTeamMembers } from '@/lib/lichess/api';

// Get members of a team
const members = await getTeamMembers('lichess-swiss');

if (members) {
  console.log(`${members.length} members found`);
  
  members.slice(0, 5).forEach(member => {
    console.log(`${member.username} (${member.id})`);
    if (member.role) {
      console.log(`Role: ${member.role}`);
    }
  });
}
Team Membership
joinTeam(teamId, password?, message?)
Joins a team.

Authentication Required: Yes

Parameters:

teamId: ID of the team to join
password: (Optional) Password if the team requires it
message: (Optional) Message to the team leader if join requests need approval
Returns: A Promise that resolves to true if successful, or throws an error.

Example:
import { joinTeam } from '@/lib/lichess/api';

// Join a public team
try {
  const success = await joinTeam('lichess-swiss');
  
  if (success) {
    console.log('Successfully joined the team!');
  }
} catch (error) {
  console.error('Failed to join team:', error.message);
  
  // Check for specific error cases
  if (error.message.includes('password')) {
    console.log('This team requires a password to join');
  } else if (error.message.includes('moderated')) {
    console.log('This team requires approval to join');
  }
}

// Join a private team with password
try {
  const success = await joinTeam('private-team-id', 'secretPassword');
  
  if (success) {
    console.log('Successfully joined the private team!');
  }
} catch (error) {
  console.error('Failed to join private team:', error.message);
}

// Join a team that requires approval with a message
try {
  const success = await joinTeam(
    'moderated-team-id', 
    undefined, 
    'Hi! I would love to join your team because...'
  );
  
  if (success) {
    console.log('Join request submitted successfully');
  }
} catch (error) {
  console.error('Failed to submit join request:', error.message);
}
leaveTeam(teamId)
Leaves a team.

Authentication Required: Yes

Parameters:

teamId: ID of the team to leave
Returns: A Promise that resolves to true if successful, or throws an error.

Example:
import { leaveTeam } from '@/lib/lichess/api';

// Leave a team
try {
  const success = await leaveTeam('lichess-swiss');
  
  if (success) {
    console.log('Successfully left the team');
  }
} catch (error) {
  console.error('Failed to leave team:', error.message);
}
Team Administration
getTeamJoinRequests(teamId)
Gets join requests for a team you manage.

Authentication Required: Yes (must be a team leader)

Parameters:

teamId: ID of the team
Returns: A Promise that resolves to a list of join requests or throws an error.

Example:
import { getTeamJoinRequests } from '@/lib/lichess/api';

// Get pending join requests
try {
  const requests = await getTeamJoinRequests('my-team-id');
  
  console.log(`${requests.length} pending requests`);
  
  requests.forEach(request => {
    console.log(`User: ${request.user.name}`);
    console.log(`Message: ${request.message}`);
    console.log(`Requested at: ${new Date(request.date).toLocaleString()}`);
    console.log('---');
  });
} catch (error) {
  console.error('Failed to get join requests:', error.message);
  
  if (error.message.includes('Authorization')) {
    console.log('You must be a team leader to view join requests');
  }
}
acceptJoinRequest(teamId, userId)
Accepts a join request.

Authentication Required: Yes (must be a team leader)

Parameters:

teamId: ID of the team
userId: User ID to accept
Returns: A Promise that resolves to true if successful, or throws an error.

Example:

import { acceptJoinRequest } from '@/lib/lichess/api';

// Accept a join request
try {
  const success = await acceptJoinRequest('my-team-id', 'user-id-to-accept');
  
  if (success) {
    console.log('Successfully accepted the join request');
  }
} catch (error) {
  console.error('Failed to accept join request:', error.message);
}
declineJoinRequest(teamId, userId)
Declines a join request.

Authentication Required: Yes (must be a team leader)

Parameters:

teamId: ID of the team
userId: User ID to decline
Returns: A Promise that resolves to true if successful, or throws an error.

Example:
import { declineJoinRequest } from '@/lib/lichess/api';

// Decline a join request
try {
  const success = await declineJoinRequest('my-team-id', 'user-id-to-decline');
  
  if (success) {
    console.log('Successfully declined the join request');
  }
} catch (error) {
  console.error('Failed to decline join request:', error.message);
}
kickTeamMember(teamId, userId)
Kicks a user from your team.

Authentication Required: Yes (must be a team leader)

Parameters:

teamId: ID of the team
userId: User ID to kick
Returns: A Promise that resolves to true if successful, or throws an error.

Example:
import { kickTeamMember } from '@/lib/lichess/api';

// Kick a team member
try {
  const success = await kickTeamMember('my-team-id', 'user-id-to-kick');
  
  if (success) {
    console.log('Successfully removed the user from the team');
  }
} catch (error) {
  console.error('Failed to kick team member:', error.message);
}
messageAllTeamMembers(teamId, message)
Messages all members of a team.

Authentication Required: Yes (must be a team leader)

Parameters:

teamId: ID of the team
message: Message to send to all members
Returns: A Promise that resolves to true if successful, or throws an error.

Example:
import { messageAllTeamMembers } from '@/lib/lichess/api';

// Send a message to all team members
try {
  const success = await messageAllTeamMembers(
    'my-team-id',
    'Hello everyone! We have an upcoming tournament this weekend.'
  );
  
  if (success) {
    console.log('Successfully sent message to all team members');
  }
} catch (error) {
  console.error('Failed to message team members:', error.message);
}
Response Data Structures
Team Data
The team data returned by getTeam typically includes:

interface Team {
  id: string;
  name: string;
  description: string;
  open: boolean;
  leader: {
    id: string;
    name: string;
  };
  leaders: Array<{
    id: string;
    name: string;
  }>;
  nbMembers: number;
  location?: string;
  isRequestable?: boolean;
}
Team Member Data
The team member data returned by getTeamMembers typically includes:
interface TeamMember {
  id: string;
  username: string;
  perfs: Record<string, {
    rating: number;
    progress: number;
  }>;
  title?: string;
  online: boolean;
  playing: boolean;
  streaming?: boolean;
  patron?: boolean;
  role?: string; // 'member', 'leader', etc.
}

    console.log(`${teams.length} teams found`);
    teams.forEach(team => {
        console.log(`${team.name} (${team.id})`);
    });
}
```

### Team Members

#### `getTeamMembers(teamId)`

Gets members of a team.

**Authentication Required:** Yes (for private teams)

**Parameters:**
- `teamId`: The ID of the team

**Returns:**
A Promise that resolves to an array of team members or `null` on error.

**Example:**
```typescript
import { getTeamMembers } from '@/lib/lichess/api';

// Get members of a team
const members = await getTeamMembers('lichess-swiss');

if (members) {
    console.log(`${members.length} members found`);
    
    members.slice(0, 5).forEach(member => {
        console.log(`${member.username} (${member.id})`);
        if (member.role) {
            console.log(`Role: ${member.role}`);
        }
    });
}
```

### Team Membership

#### `joinTeam(teamId, password?, message?)`

Joins a team.

**Authentication Required:** Yes

**Parameters:**
- `teamId`: ID of the team to join
- `password`: (Optional) Password if the team requires it
- `message`: (Optional) Message to the team leader if join requests need approval

**Returns:**
A Promise that resolves to `true` if successful, or throws an error.

**Example:**
```typescript
import { joinTeam } from '@/lib/lichess/api';

// Join a public team
try {
    const success = await joinTeam('lichess-swiss');
    
    if (success) {
        console.log('Successfully joined the team!');
    }
} catch (error) {
    console.error('Failed to join team:', error.message);
    
    // Check for specific error cases
    if (error.message.includes('password')) {
        console.log('This team requires a password to join');
    } else if (error.message.includes('moderated')) {
        console.log('This team requires approval to join');
    }
}

// Join a private team with password
try {
    const success = await joinTeam('private-team-id', 'secretPassword');
    
    if (success) {
        console.log('Successfully joined the private team!');
    }
} catch (error) {
    console.error('Failed to join private team:', error.message);
}

// Join a team that requires approval with a message
try {
    const success = await joinTeam(
        'moderated-team-id', 
        undefined, 
        'Hi! I would love to join your team because...'
    );
    
    if (success) {
        console.log('Join request submitted successfully');
    }
} catch (error) {
    console.error('Failed to submit join request:', error.message);
}
```

#### `leaveTeam(teamId)`

Leaves a team.

**Authentication Required:** Yes

**Parameters:**
- `teamId`: ID of the team to leave

**Returns:**
A Promise that resolves to `true` if successful, or throws an error.

**Example:**
```typescript
import { leaveTeam } from '@/lib/lichess/api';

// Leave a team
try {
    const success = await leaveTeam('lichess-swiss');
    
    if (success) {
        console.log('Successfully left the team');
    }
} catch (error) {
    console.error('Failed to leave team:', error.message);
}
```

### Team Administration

#### `getTeamJoinRequests(teamId)`

Gets join requests for a team you manage.

**Authentication Required:** Yes (must be a team leader)

**Parameters:**
- `teamId`: ID of the team

**Returns:**
A Promise that resolves to a list of join requests or throws an error.

**Example:**
```typescript
import { getTeamJoinRequests } from '@/lib/lichess/api';

// Get pending join requests
try {
    const requests = await getTeamJoinRequests('my-team-id');
    
    console.log(`${requests.length} pending requests`);
    
    requests.forEach(request => {
        console.log(`User: ${request.user.name}`);
        console.log(`Message: ${request.message}`);
        console.log(`Requested at: ${new Date(request.date).toLocaleString()}`);
        console.log('---');
    });
} catch (error) {
    console.error('Failed to get join requests:', error.message);
    
    if (error.message.includes('Authorization')) {
        console.log('You must be a team leader to view join requests');
    }
}
```

#### `acceptJoinRequest(teamId, userId)`

Accepts a join request.

**Authentication Required:** Yes (must be a team leader)

**Parameters:**
- `teamId`: ID of the team
- `userId`: User ID to accept

**Returns:**
A Promise that resolves to `true` if successful, or throws an error.

**Example:**
```typescript
import { acceptJoinRequest } from '@/lib/lichess/api';

// Accept a join request
try {
    const success = await acceptJoinRequest('my-team-id', 'user-id-to-accept');
    
    if (success) {
        console.log('Successfully accepted the join request');
    }
} catch (error) {
    console.error('Failed to accept join request:', error.message);
}
```

#### `declineJoinRequest(teamId, userId)`

Declines a join request.

**Authentication Required:** Yes (must be a team leader)

**Parameters:**
- `teamId`: ID of the team
- `userId`: User ID to decline

**Returns:**
A Promise that resolves to `true` if successful, or throws an error.

**Example:**
```typescript
import { declineJoinRequest } from '@/lib/lichess/api';

// Decline a join request
try {
    const success = await declineJoinRequest('my-team-id', 'user-id-to-decline');
    
    if (success) {
        console.log('Successfully declined the join request');
    }
} catch (error) {
    console.error('Failed to decline join request:', error.message);
}
```

#### `kickTeamMember(teamId, userId)`

Kicks a user from your team.

**Authentication Required:** Yes (must be a team leader)

**Parameters:**
- `teamId`: ID of the team
- `userId`: User ID to kick

**Returns:**
A Promise that resolves to `true` if successful, or throws an error.

**Example:**
```typescript
import { kickTeamMember } from '@/lib/lichess/api';

// Kick a team member
try {
    const success = await kickTeamMember('my-team-id', 'user-id-to-kick');
    
    if (success) {
        console.log('Successfully removed the user from the team');
    }
} catch (error) {
    console.error('Failed to kick team member:', error.message);
}
```

#### `messageAllTeamMembers(teamId, message)`

Messages all members of a team.

**Authentication Required:** Yes (must be a team leader)

**Parameters:**
- `teamId`: ID of the team
- `message`: Message to send to all members

**Returns:**
A Promise that resolves to `true` if successful, or throws an error.

**Example:**
```typescript
import { messageAllTeamMembers } from '@/lib/lichess/api';

// Send a message to all team members
try {
    const success = await messageAllTeamMembers(
        'my-team-id',
        'Hello everyone! We have an upcoming tournament this weekend.'
    );
    
    if (success) {
        console.log('Successfully sent message to all team members');
    }
} catch (error) {
    console.error('Failed to message team members:', error.message);
}
```

### Response Data Structures

#### Team Data

The team data returned by `getTeam` typically includes:
```typescript
interface Team {
    id: string;
    name: string;
    description: string;
    open: boolean;
    leader: {
        id: string;
        name: string;
    };
    leaders: Array<{
        id: string;
        name: string;
    }>;
    nbMembers: number;
    location?: string;
    isRequestable?: boolean;
}
```

#### Team Member Data

The team member data returned by `getTeamMembers` typically includes:
```typescript
interface TeamMember {
    id: string;
    username: string;
    perfs: Record<string, {
        rating: number;
        progress: number;
    }>;
    title?: string;
    online: boolean;
    playing: boolean;
    streaming?: boolean;
    patron?: boolean;
    role?: string; // 'member', 'leader', etc.
}
```

#### Join Request Data

The join request data returned by `getTeamJoinRequests` typically includes:
```typescript
interface JoinRequest {
    id: string;
    user: {
        id: string;
        name: string;
        title?: string;
        online: boolean;
    };
    date: number; // timestamp
    message?: string;
}
```
The join request data returned by getTeamJoinRequests typically includes:
```typescript
interface JoinRequest {
  id: string;
  user: {
    id: string;
    name: string;
    title?: string;
    online: boolean;
  };
  date: number; // timestamp
  message?: string;
}
```
### Common Use Cases
#### Team Management Dashboard
```typescript
import { 
  getTeam, 
  getTeamMembers, 
  getTeamJoinRequests, 
  acceptJoinRequest, 
  declineJoinRequest,
  kickTeamMember
} from '@/lib/lichess/api';
import { useAuth } from '@/lib/lichess/hooks';
import { useState, useEffect } from 'react';

function TeamDashboard({ teamId }) {
  const { isAuthenticated, login } = useAuth();
  const [team, setTeam] = useState(null);
  const [members, setMembers] = useState([]);
  const [joinRequests, setJoinRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('info');
  
  useEffect(() => {
    async function loadTeamData() {
      try {
        setLoading(true);
        setError(null);
        
        // Load basic team info
        const teamData = await getTeam(teamId);
        if (!teamData) {
          throw new Error('Team not found');
        }
        
        setTeam(teamData);
        
        // Load team members
        const membersData = await getTeamMembers(teamId);
        setMembers(membersData || []);
        
        // If authenticated, try to load join requests
        if (isAuthenticated) {
          try {
            const requestsData = await getTeamJoinRequests(teamId);
            setJoinRequests(requestsData || []);
          } catch (err) {
            // Silently fail if not a leader
            console.log('Could not load join requests:', err);
          }
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    if (teamId) {
      loadTeamData();
    }
  }, [teamId, isAuthenticated]);
  
  async function handleAcceptRequest(userId) {
    try {
      await acceptJoinRequest(teamId, userId);
      // Update the join requests list
      setJoinRequests(joinRequests.filter(req => req.user.id !== userId));
      // Reload members
      const membersData = await getTeamMembers(teamId);
      setMembers(membersData || []);
    } catch (err) {
      setError(`Failed to accept request: ${err.message}`);
    }
  }
  
  async function handleDeclineRequest(userId) {
    try {
      await declineJoinRequest(teamId, userId);
      // Update the join requests list
      setJoinRequests(joinRequests.filter(req => req.user.id !== userId));
    } catch (err) {
      setError(`Failed to decline request: ${err.message}`);
    }
  }
  
  async function handleKickMember(userId) {
    if (!confirm('Are you sure you want to remove this member?')) {
      return;
    }
    
    try {
      await kickTeamMember(teamId, userId);
      // Update the members list
      setMembers(members.filter(member => member.id !== userId));
    } catch (err) {
      setError(`Failed to remove member: ${err.message}`);
    }
  }
  
  if (loading) return <div>Loading team data...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!team) return <div>Team not found</div>;
  
  const isLeader = team.leaders.some(leader => leader.id === /* current user id */);
  
  return (
    <div className="team-dashboard">
      <div className="team-header">
        <h1>{team.name}</h1>
        <div className="team-stats">
          <span>{team.nbMembers} members</span>
          {team.location && <span>Location: {team.location}</span>}
          <span>Status: {team.open ? 'Open' : team.isRequestable ? 'Approval Required' : 'Closed'}</span>
        </div>
      </div>
      
      <div className="team-tabs">
        <button 
          className={activeTab === 'info' ? 'active' : ''} 
          onClick={() => setActiveTab('info')}
        >
          Info
        </button>
        <button 
          className={activeTab === 'members' ? 'active' : ''} 
          onClick={() => setActiveTab('members')}
        >
          Members ({members.length})
        </button>
        {isLeader && (
          <button 
            className={activeTab === 'requests' ? 'active' : ''} 
            onClick={() => setActiveTab('requests')}
          >
            Join Requests ({joinRequests.length})
          </button>
        )}
      </div>
      
      <div className="tab-content">
        {activeTab === 'info' && (
          <div className="team-info">
            <h2>About</h2>
            <div className="team-description" dangerouslySetInnerHTML={{ __html: team.description }} />
            
            <h3>Leaders</h3>
            <ul className="team-leaders">
              {team.leaders.map(leader => (
                <li key={leader.id}>
                  <a href={`https://lichess.org/@/${leader.name}`} target="_blank" rel="noopener noreferrer">
                    {leader.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {activeTab === 'members' && (
          <div className="team-members">
            <h2>Members</h2>
            <div className="members-list">
              {members.map(member => (
                <div key={member.id} className="member-card">
                  <div className="member-info">
                    <a href={`https://lichess.org/@/${member.username}`} target="_blank" rel="noopener noreferrer">
                      {member.title && <span className="member-title">{member.title}</span>}
                      {member.username}
                    </a>
                    <span className={`status-dot ${member.online ? 'online' : 'offline'}`} />
                  </div>
                  
                  {isLeader && member.id !== /* current user id */ && (
                    <button 
                      className="kick-button" 
                      onClick={() => handleKickMember(member.id)}
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {activeTab === 'requests' && isLeader && (
          <div className="join-requests">
            <h2>Join Requests</h2>
            
            {joinRequests.length === 0 ? (
              <p>No pending join requests</p>
            ) : (
              <div className="requests-list">
                {joinRequests.map(request => (
                  <div key={request.id} className="request-card">
                    <div className="request-info">
                      <a href={`https://lichess.org/@/${request.user.name}`} target="_blank" rel="noopener noreferrer">
                        {request.user.title && <span className="user-title">{request.user.title}</span>}
                        {request.user.name}
                      </a>
                      <span className="request-date">
                        {new Date(request.date).toLocaleDateString()}
                      </span>
                    </div>
                    
                    {request.message && (
                      <div className="request-message">
                        "{request.message}"
                      </div>
                    )}
                    
                    <div className="request-actions">
                      <button 
                        className="accept-button" 
                        onClick={() => handleAcceptRequest(request.user.id)}
                      >
                        Accept
                      </button>
                      <button 
                        className="decline-button" 
                        onClick={() => handleDeclineRequest(request.user.id)}
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
```
Team Search and Join Component
```typescript
import { searchTeams, joinTeam } from '@/lib/lichess/api';
import { useAuth } from '@/lib/lichess/hooks';
import { useState } from 'react';

function TeamSearch() {
  const { isAuthenticated, login } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [joinState, setJoinState] = useState({
    teamId: null,
    joining: false,
    error: null,
    password: '',
    message: '',
    requiresPassword: false,
    requiresApproval: false
  });
  
  async function handleSearch(e) {
    e.preventDefault();
    
    if (!query.trim()) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const data = await searchTeams(query);
      
      if (data) {
        setResults(data);
      } else {
        setError('No results found or search failed');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }
  
  function prepareJoin(team) {
    setJoinState({
      teamId: team.id,
      joining: false,
      error: null,
      password: '',
      message: '',
      requiresPassword: !team.open,  // Simplified - may need adjustment
      requiresApproval: team.isRequestable
    });
  }
  
  async function handleJoin() {
    if (!isAuthenticated) {
      login();
      return;
    }
    
    const { teamId, password, message, requiresPassword, requiresApproval } = joinState;
    
    // Validate input
    if (requiresPassword && !password) {
      setJoinState({ ...joinState, error: 'Password is required' });
      return;
    }
    
    if (requiresApproval && !message) {
      setJoinState({ ...joinState, error: 'Please provide a message to team leaders' });
      return;
    }
    
    try {
      setJoinState({ ...joinState, joining: true, error: null });
      
      await joinTeam(
        teamId,
        requiresPassword ? password : undefined,
        requiresApproval ? message : undefined
      );
      
      // Success - update UI
      setJoinState({
        ...joinState,
        joining: false,
        success: true
      });
      
      // Update the results to show the team as joined
      if (results) {
        setResults({
          ...results,
          currentPageResults: results.currentPageResults.map(team => 
            team.id === teamId ? { ...team, joined: true } : team
          )
        });
      }
    } catch (err) {
      setJoinState({
        ...joinState,
        joining: false,
        error: err.message
      });
    }
  }
  
  function cancelJoin() {
    setJoinState({
      teamId: null,
      joining: false,
      error: null,
      password: '',
      message: '',
      requiresPassword: false,
      requiresApproval: false
    });
  }
  
  return (
    <div className="team-search">
      <h2>Find Teams</h2>
      
      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for teams..."
        />
        <button type="submit" disabled={loading || !query.trim()}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>
      
      {error && <p className="error">Error: {error}</p>}
      
      {results && (
        <div className="search-results">
          <h3>Found {results.nbResults} teams</h3>
          
          {results.currentPageResults.length > 0 ? (
            <div className="teams-list">
              {results.currentPageResults.map(team => (
                <div key={team.id} className="team-card">
                  <div className="team-card-header">
                    <h4>{team.name}</h4>
                    <span className="member-count">{team.nbMembers} members</span>
                  </div>
                  
                  <div className="team-card-body">
                    {team.description && (
                      <div className="team-description" dangerouslySetInnerHTML={{ __html: team.description.substring(0, 150) + '...' }} />
                    )}
                    
                    <div className="team-meta">
                      {team.location && <span>Location: {team.location}</span>}
                      <span>Status: {team.open ? 'Open' : team.isRequestable ? 'Approval Required' : 'Closed'}</span>
                    </div>
                  </div>
                  
                  <div className="team-card-actions">
                    <a 
                      href={`https://lichess.org/team/${team.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="view-button"
                    >
                      View on Lichess
                    </a>
                    
                    {team.joined ? (
                      <span className="joined-badge">Joined</span>
                    ) : (
                      <button 
                        onClick={() => prepareJoin(team)}
                        className="join-button"
                      >
                        Join Team
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>No teams found matching "{query}"</p>
          )}
          
          {results.nbPages > 1 && (
            <div className="pagination">
              <button 
                disabled={results.page === 1} 
                onClick={() => searchTeams(query, results.page - 1).then(setResults)}
              >
                Previous
              </button>
              <span>Page {results.page} of {results.nbPages}</span>
              <button 
                disabled={results.page === results.nbPages} 
                onClick={() => searchTeams(query, results.page + 1).then(setResults)}
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
      
      {joinState.teamId && (
        <div className="join-modal">
          <div className="join-modal-content">
            <h3>Join Team</h3>
            
            {joinState.error && (
              <p className="error">{joinState.error}</p>
            )}
            
            {joinState.success ? (
              <div className="success-message">
                <p>Successfully joined the team!</p>
                <button onClick={cancelJoin}>Close</button>
              </div>
            ) : (
              <>
                {joinState.requiresPassword && (
                  <div className="form-group">
                    <label>Password:</label>
                    <input
                      type="password"
                      value={joinState.password}
                      onChange={(e) => setJoinState({ ...joinState, password: e.target.value })}
                      placeholder="Enter team password"
                    />
                  </div>
                )}
                
                {joinState.requiresApproval && (
                  <div className="form-group">
                    <label>Message to Team Leaders:</label>
                    <textarea
                      value={joinState.message}
                      onChange={(e) => setJoinState({ ...joinState, message: e.target.value })}
                      placeholder="Why do you want to join this team?"
                      rows={4}
                    />
                  </div>
                )}
                
                <div className="join-modal-actions">
                  <button
                    onClick={handleJoin}
                    disabled={joinState.joining}
                    className="confirm-button"
                  >
                    {joinState.joining ? 'Joining...' : 'Confirm Join'}
                  </button>
                  <button
                    onClick={cancelJoin}
                    disabled={joinState.joining}
                    className="cancel-button"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
```