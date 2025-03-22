# Lichess API Library Documentation

Welcome to the documentation for the Lichess API Library. This library provides a comprehensive TypeScript interface to the Lichess API, with React hooks for easy integration in React applications.

## Overview

The Lichess API Library is structured into several modules:

- **API Modules**: Direct interfaces to Lichess API endpoints
- **React Hooks**: Ready-to-use React hooks for data fetching and state management
- **Authentication**: OAuth authentication flow for Lichess
- **Types**: TypeScript definitions for all API objects

## Documentation Sections

- [Getting Started](./GETTING-STARTED.md) - Quick setup guide
- [Authentication](./AUTHENTICATION.md) - Authentication flow documentation
- [API Overview](./API-OVERVIEW.md) - API structure and patterns
- [API Reference](./api/) - Documentation for all API modules
- [Hooks Reference](./hooks/) - Documentation for all React hooks
- [Examples](./examples/) - Code examples for common use cases

## Key Features

- **Full TypeScript Support**: Type definitions for all API responses
- **OAuth Authentication**: Complete OAuth flow integration
- **React Integration**: Hooks for all API functionalities
- **Error Handling**: Consistent error handling across the library
- **Comprehensive Coverage**: Support for games, puzzles, teams, tournaments, and more

## Installation

This library is built into the EthChess website project. No separate installation is required.

## Acknowledgments

This project uses several open-source libraries and tools, including:

- [React](https://reactjs.org/) - MIT License
- [Next.js](https://nextjs.org/) - MIT License
- [TypeScript](https://www.typescriptlang.org/) - Apache 2.0 License
We are grateful to the open-source community for their contributions.

## Basic Usage

```tsx
import { useAuth, useUser } from '@/lib/lichess/hooks';

function UserProfile() {
  const { isAuthenticated, login } = useAuth();
  const { user, loading } = useUser();
  
  if (!isAuthenticated) {
    return (
      <div>
        <p>Please log in to view your profile</p>
        <button onClick={login}>Login with Lichess</button>
      </div>
    );
  }
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  return (
    <div>
      <h1>{user?.username}</h1>
      <p>Rating: {user?.perfs?.rapid?.rating || 'Unrated'}</p>
    </div>
  );
}