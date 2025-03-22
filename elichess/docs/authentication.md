# Lichess Authentication

This document explains how authentication with the Lichess API works in this library.

## Overview

The library implements authentication using the OAuth 2.0 authorization code flow with PKCE (Proof Key for Code Exchange) extension. This provides a secure way to authenticate with Lichess without needing to store client secrets in the browser.

## Authentication Flow

1. **Generate PKCE Challenge**: When a login is initiated, the library generates a code verifier and code challenge
2. **Redirect to Lichess**: The user is redirected to Lichess with the code challenge
3. **User Authorization**: User logs in to Lichess and authorizes the application
4. **Callback Processing**: Lichess redirects back with an authorization code
5. **Token Retrieval**: The code is exchanged for an access token using the code verifier
6. **Session Management**: The library creates and manages a session with the token

## Auth Module Structure
auth/ ├── index.ts # Main auth exports and high-level functions ├── oauth.ts # OAuth implementation details ├── pkce.ts # PKCE challenge generation and verification └── session.ts # Session management utilities


## Core Authentication Functions

### `login()`

Initiates the authentication flow by redirecting to Lichess.

```typescript
import { login } from '@/lib/lichess/auth';

function LoginButton() {
  return <button onClick={() => login()}>Login with Lichess</button>;
  }
```

### `logout()`

Ends the current session and clears authentication data.
### `logout()`

Ends the current session and clears authentication data.

```typescript
import { logout } from '@/lib/lichess/auth';

function LogoutButton() {
  return (
    <button onClick={() => logout()}>
      Logout
    </button>
  );
}
```

### `getSession()`
Retrieves the current authentication session if one exists.

```typescript
import { getSession } from '@/lib/lichess/auth';

async function checkSession() {
  const session = await getSession();
  if (session) {
    console.log(`Logged in as: ${session.user.username}`);
  } else {
    console.log('Not logged in');
  }
}
```
### `isAuthenticated()`

Checks if the user is currently authenticated.

```typescript
import { isAuthenticated } from '@/lib/lichess/auth';

async function checkAuth() {
  const authenticated = await isAuthenticated();
  console.log(`User is ${authenticated ? 'logged in' : 'not logged in'}`);
}
```

### React Hooks for Authentication
The library provides a React hook for easy integration with React components:
```typescript
import { useAuth } from '@/lib/lichess/hooks';

function AuthControls() {
  const { isAuthenticated, loading, error, login, logout } = useAuth();
  
  if (loading) return <p>Loading authentication state...</p>;
  
  return (
    <div>
      {isAuthenticated ? (
        <button onClick={logout}>Logout</button>
      ) : (
        <button onClick={login}>Login with Lichess</button>
      )}
      
      {error && <p className="error">Authentication error: {error.message}</p>}
    </div>
  );
}
```

### Using Authentication with API Calls
Most API calls will automatically use the authenticated session:

```typescript
import { fetchUserProfile } from '@/lib/lichess/api';

// If authenticated, this will return the current user's profile
async function getUserProfile() {
  try {
    const profile = await fetchUserProfile();
    return profile;
  } catch (error) {
    // Handle unauthenticated state or other errors
    console.error('Failed to load profile:', error);
    return null;
  }
}
```

## PKCE Implementation
The library uses PKCE (Proof Key for Code Exchange) to secure the OAuth flow:

Generates a random code verifier
Creates a code challenge from the verifier using SHA-256
Sends the challenge to Lichess during authorization
Uses the original verifier when exchanging the code for a token
This prevents authorization code interception attacks and enhances security.

## Security Considerations
Access tokens are stored securely and not exposed to client-side JavaScript
The library implements proper token validation and refresh logic
Authentication state is checked on each page load to ensure consistency

### Troubleshooting
### Common Issues
#### Issue: Authentication redirects to Lichess but doesn't return to the app

Ensure your application is correctly handling the callback route

#### Issue: "Authentication required" errors when making API calls

Check if the user is properly authenticated with isAuthenticated()
Make sure your session hasn't expired

#### Issue: Session disappears unexpectedly

Check for cookie storage issues in your browser
Ensure your application isn't clearing session data