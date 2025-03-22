# Relations API

The Relations API provides functions for managing social relationships between Lichess users, including following, unfollowing, blocking, and unblocking other players.

## Overview

Lichess allows users to follow other players to easily track their games and activities. Users can also block players they don't wish to interact with. This API module provides functions to manage these relationships.

## Functions

### `getFollowing()`

Gets the list of players that the current authenticated user follows.

**Authentication Required**: Yes

**Returns**: A Promise that resolves to an array of user objects or `null` on error.

**Example**:
```typescript
import { getFollowing } from '@/lib/lichess/api';

// Get list of followed users
try {
    const followedUsers = await getFollowing();
    
    if (followedUsers) {
        console.log(`You follow ${followedUsers.length} users`);
        followedUsers.forEach(user => {
            console.log(`${user.name} (${user.id})`);
        });
    }
} catch (error) {
    console.error('Authentication required:', error);
    // Prompt user to log in
}
```

### `followUser(username)`

Follows a specific player.

**Authentication Required**: Yes

**Parameters**:
- `username`: The username of the player to follow

**Returns**: A Promise that resolves to true if successful, or throws an error.

**Example**:
```typescript
import { followUser } from '@/lib/lichess/api';

// Follow a player
try {
    const success = await followUser('MagnusCarlsen');
    
    if (success) {
        console.log('Successfully followed MagnusCarlsen');
    }
} catch (error) {
    console.error('Failed to follow user:', error);
}
```

### `unfollowUser(username)`

Unfollows a specific player.

**Authentication Required**: Yes

**Parameters**:
- `username`: The username of the player to unfollow

**Returns**: A Promise that resolves to true if successful, or throws an error.

**Example**:
```typescript
import { unfollowUser } from '@/lib/lichess/api';

// Unfollow a player
try {
    const success = await unfollowUser('MagnusCarlsen');
    
    if (success) {
        console.log('Successfully unfollowed MagnusCarlsen');
    }
} catch (error) {
    console.error('Failed to unfollow user:', error);
}
```

### `blockUser(username)`

Blocks a specific player, preventing them from challenging you or sending you messages.

**Authentication Required**: Yes

**Parameters**:
- `username`: The username of the player to block

**Returns**: A Promise that resolves to true if successful, or throws an error.

**Example**:
```typescript
import { blockUser } from '@/lib/lichess/api';

// Block a player
try {
    const success = await blockUser('DisruptivePlayer');
    
    if (success) {
        console.log('Successfully blocked DisruptivePlayer');
    }
} catch (error) {
    console.error('Failed to block user:', error);
}
```

### `unblockUser(username)`

Unblocks a previously blocked player.

**Authentication Required**: Yes

**Parameters**:
- `username`: The username of the player to unblock

**Returns**: A Promise that resolves to true if successful, or throws an error.

**Example**:
```typescript
import { unblockUser } from '@/lib/lichess/api';

// Unblock a player
try {
    const success = await unblockUser('FormerlyDisruptivePlayer');
    
    if (success) {
        console.log('Successfully unblocked FormerlyDisruptivePlayer');
    }
} catch (error) {
    console.error('Failed to unblock user:', error);
}
```

## Common Use Cases

### Building a User Following Management UI

```typescript
import { getFollowing, followUser, unfollowUser } from '@/lib/lichess/api';
import { useAuth } from '@/lib/lichess/hooks';
import { useState, useEffect } from 'react';

function FollowingManager() {
    const { isAuthenticated, login } = useAuth();
    const [followedUsers, setFollowedUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [usernameToFollow, setUsernameToFollow] = useState('');
    
    useEffect(() => {
        if (isAuthenticated) {
            loadFollowedUsers();
        }
    }, [isAuthenticated]);
    
    async function loadFollowedUsers() {
        try {
            setLoading(true);
            setError(null);
            
            const users = await getFollowing();
            
            if (users) {
                setFollowedUsers(users);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }
    
    async function handleFollowUser(e) {
        e.preventDefault();
        
        if (!usernameToFollow.trim()) return;
        
        try {
            setLoading(true);
            setError(null);
            
            await followUser(usernameToFollow);
            setUsernameToFollow('');
            
            // Refresh the followed users list
            await loadFollowedUsers();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }
    
    async function handleUnfollowUser(username) {
        try {
            setLoading(true);
            setError(null);
            
            await unfollowUser(username);
            
            // Refresh the followed users list
            await loadFollowedUsers();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }
    
    if (!isAuthenticated) {
        return (
            <div className="following-manager">
                <h2>Following Manager</h2>
                <p>Please log in to manage who you follow</p>
                <button onClick={login}>Login with Lichess</button>
            </div>
        );
    }
    
    return (
        <div className="following-manager">
            <h2>Users You Follow</h2>
            
            <form onSubmit={handleFollowUser} className="follow-form">
                <input
                    type="text"
                    value={usernameToFollow}
                    onChange={(e) => setUsernameToFollow(e.target.value)}
                    placeholder="Username to follow"
                />
                <button type="submit" disabled={loading || !usernameToFollow.trim()}>
                    Follow User
                </button>
            </form>
            
            {error && <p className="error">Error: {error}</p>}
            
            {loading ? (
                <p>Loading...</p>
            ) : followedUsers.length > 0 ? (
                <ul className="followed-users-list">
                    {followedUsers.map((user) => (
                        <li key={user.id}>
                            <a
                                href={`https://lichess.org/@/${user.name}`}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                {user.name}
                            </a>
                            {user.patron && <span className="patron-badge">Patron</span>}
                            <button
                                onClick={() => handleUnfollowUser(user.name)}
                                className="unfollow-button"
                                disabled={loading}
                            >
                                Unfollow
                            </button>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>You are not following any users yet.</p>
            )}
        </div>
    );
}
```

### Blocking Management

```typescript
import { blockUser, unblockUser } from '@/lib/lichess/api';
import { useState } from 'react';

function BlockUserForm() {
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    
    async function handleBlock(e) {
        e.preventDefault();
        
        if (!username.trim()) return;
        
        try {
            setLoading(true);
            setError(null);
            setResult(null);
            
            await blockUser(username);
            
            setResult(`Successfully blocked ${username}`);
            setUsername('');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }
    
    async function handleUnblock(e) {
        e.preventDefault();
        
        if (!username.trim()) return;
        
        try {
            setLoading(true);
            setError(null);
            setResult(null);
            
            await unblockUser(username);
            
            setResult(`Successfully unblocked ${username}`);
            setUsername('');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }
    
    return (
        <div className="block-management">
            <h2>User Blocking</h2>
            
            <form className="block-form">
                <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter username"
                />
                
                <div className="button-group">
                    <button
                        type="button"
                        onClick={handleBlock}
                        disabled={loading || !username.trim()}
                    >
                        Block User
                    </button>
                    
                    <button
                        type="button"
                        onClick={handleUnblock}
                        disabled={loading || !username.trim()}
                    >
                        Unblock User
                    </button>
                </div>
            </form>
            
            {loading && <p>Processing...</p>}
            {error && <p className="error">Error: {error}</p>}
            {result && <p className="success">{result}</p>}
            
            <div className="info-box">
                <h3>About Blocking</h3>
                <p>
                    When you block someone on Lichess:
                </p>
                <ul>
                    <li>They cannot challenge you to games</li>
                    <li>They cannot send you messages</li>
                    <li>They cannot comment on your studies or forum posts</li>
                    <li>You will not see their chat messages in public chats</li>
                </ul>
            </div>
        </div>
    );
}
```

### Building a Social Tab in User Profiles

```typescript
import { followUser, unfollowUser } from '@/lib/lichess/api';
import { useAuth } from '@/lib/lichess/hooks';
import { useState } from 'react';

function UserProfileSocialActions({ username, isFollowing: initialIsFollowing }) {
    const { isAuthenticated, login } = useAuth();
    const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    async function handleFollowToggle() {
        if (!isAuthenticated) {
            login();
            return;
        }
        
        try {
            setLoading(true);
            setError(null);
            
            if (isFollowing) {
                await unfollowUser(username);
                setIsFollowing(false);
            } else {
                await followUser(username);
                setIsFollowing(true);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }
    
    return (
        <div className="profile-social-actions">
            <button
                onClick={handleFollowToggle}
                disabled={loading}
                className={isFollowing ? 'following' : ''}
            >
                {loading
                    ? 'Processing...'
                    : isFollowing
                    ? 'Following'
                    : 'Follow'}
            </button>
            
            {error && <p className="error">{error}</p>}
            
            <div className="social-links">
                <a
                    href={`https://lichess.org/inbox/new?user=${username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="message-link"
                >
                    Send Message
                </a>
                
                <a
                    href={`https://lichess.org/?user=${username}#friend`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="challenge-link"
                >
                    Challenge to a Game
                </a>
            </div>
        </div>
    );
}
```