# useAuth Hook

The `useAuth` hook provides authentication state and functions for interacting with Lichess authentication in your React components. This hook makes it easy to check if a user is logged in, access their session information, and perform login/logout operations.

## Usage

Import and use the `useAuth` hook in your React components to access authentication state and functions:

```tsx
import { useAuth } from '@/lib/lichess/hooks';

function AuthenticationStatus() {
    const { 
        isAuthenticated, 
        session, 
        loading, 
        error, 
        login, 
        logout, 
        refresh 
    } = useAuth();

    if (loading) return <div>Checking authentication...</div>;
    if (error) return <div>Error: {error.message}</div>;

    return (
        <div>
            {isAuthenticated ? (
                <div>
                    <p>Welcome, {session?.username}!</p>
                    <button onClick={logout}>Logout</button>
                </div>
            ) : (
                <div>
                    <p>You are not logged in.</p>
                    <button onClick={login}>Login with Lichess</button>
                </div>
            )}
        </div>
    );
}
```

## Return Value

The `useAuth` hook returns an object with the following properties:

| Property        | Type                    | Description                                                                  |
|----------------|-------------------------|------------------------------------------------------------------------------|
| `isAuthenticated` | `boolean \| null`       | `true` if the user is logged in, `false` if not, or `null` if the check hasn't completed |
| `session`      | `LichessSession \| null` | The Lichess session data if authenticated, otherwise `null`                  |
| `loading`      | `boolean`                | `true` when the authentication state is being checked                        |
| `error`        | `Error \| null`          | Error that occurred during authentication check, or `null` if no error       |
| `login`        | `() => void`             | Function to redirect to the Lichess login page                               |
| `logout`       | `() => void`             | Function to log out the current user                                         |
| `refresh`      | `() => Promise<void>`    | Function to manually refresh the authentication state                        |
                 |

## LichessSession Type

The session object contains information about the authenticated user:

```typescript
interface LichessSession {
    id: string;        // Lichess user ID
    username: string;  // Lichess username
    title?: string;    // Chess title (GM, IM, etc.) if any
    patron?: boolean;  // Whether the user is a Lichess Patron
    // Additional fields may be available depending on OAuth scopes
}
```

## Examples

### Protected Component

Create a component that only renders when the user is authenticated:

```tsx
import { useAuth } from '@/lib/lichess/hooks';
import { ReactNode } from 'react';

function ProtectedContent({ children }: { children: ReactNode }) {
    const { isAuthenticated, loading, login } = useAuth();

    if (loading) return <div>Loading...</div>;
    
    if (!isAuthenticated) {
        return (
            <div className="auth-required">
                <h3>Authentication Required</h3>
                <p>You need to log in to view this content.</p>
                <button onClick={login}>Login with Lichess</button>
            </div>
        );
    }

    return <>{children}</>;
}
```

### Profile Banner

Display a user profile banner with authentication status:

```tsx
import { useAuth } from '@/lib/lichess/hooks';

function ProfileBanner() {
    const { isAuthenticated, session, loading, login, logout } = useAuth();

    return (
        <div className="profile-banner">
            {loading ? (
                <div className="loading-indicator">Loading...</div>
            ) : isAuthenticated && session ? (
                <div className="user-info">
                    <img 
                        src={`https://lichess1.org/assets/images/user/${session.title ? 'titled' : 'default'}.svg`} 
                        alt="User Avatar" 
                    />
                    <div className="user-details">
                        <div className="username">
                            {session.title && <span className="title">{session.title}</span>}
                            {session.username}
                            {session.patron && <span className="patron-badge">Patron</span>}
                        </div>
                        <button onClick={logout} className="logout-button">Logout</button>
                    </div>
                </div>
            ) : (
                <div className="login-prompt">
                    <button onClick={login} className="login-button">
                        Login with Lichess
                    </button>
                </div>
            )}
        </div>
    );
}
```

### Navigation Menu

Add authentication-aware navigation:

```tsx
import { useAuth } from '@/lib/lichess/hooks';
import Link from 'next/link';

function Navigation() {
    const { isAuthenticated, loading, login, logout } = useAuth();

    return (
        <nav className="main-nav">
            <ul>
                <li><Link href="/">Home</Link></li>
                <li><Link href="/puzzles">Puzzles</Link></li>
                
                {isAuthenticated ? (
                    <>
                        <li><Link href="/profile">My Profile</Link></li>
                        <li><Link href="/games">My Games</Link></li>
                        <li><Link href="/tournaments">My Tournaments</Link></li>
                        <li>
                            <button onClick={logout} className="nav-button">
                                Logout
                            </button>
                        </li>
                    </>
                ) : (
                    <li>
                        <button 
                            onClick={login} 
                            className="nav-button" 
                            disabled={loading}
                        >
                            {loading ? 'Loading...' : 'Login'}
                        </button>
                    </li>
                )}
            </ul>
        </nav>
    );
}
```

### Handling Authentication Changes

Refresh data when the authentication state changes:

```tsx
import { useAuth } from '@/lib/lichess/hooks';
import { useEffect, useState } from 'react';

function MyGames() {
    const { isAuthenticated } = useAuth();
    const [games, setGames] = useState([]);

    useEffect(() => {
        async function loadGames() {
            if (isAuthenticated) {
                // Only fetch games if authenticated
                const userGames = await fetchMyGames();
                setGames(userGames);
            } else {
                // Clear games if not authenticated
                setGames([]);
            }
        }

        loadGames();
    }, [isAuthenticated]); // Re-run when auth state changes

    return (
        <div className="my-games">
            <h2>My Games</h2>
            {isAuthenticated ? (
                games.length > 0 ? (
                    <GamesList games={games} />
                ) : (
                    <p>No games found.</p>
                )
            ) : (
                <p>Please log in to view your games.</p>
            )}
        </div>
    );
}
```

### Manually Refreshing Auth State

After completing an action that might affect authentication, you can refresh the auth state:

```tsx
import { useAuth } from '@/lib/lichess/hooks';

function AccountSettings() {
    const { session, refresh } = useAuth();
    
    async function updateAccountPreferences() {
        try {
            await savePreferences();
            // Refresh the auth state to get updated session info
            await refresh();
            showSuccessMessage("Preferences updated successfully!");
        } catch (error) {
            showErrorMessage("Failed to update preferences");
        }
    }
    
    return (
        <div>
            <h2>Account Settings</h2>
            {/* Settings form components */}
            <button onClick={updateAccountPreferences}>Save Changes</button>
        </div>
    );
}
```