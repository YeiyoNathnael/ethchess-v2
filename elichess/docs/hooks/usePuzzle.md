# usePuzzle Hooks

The `usePuzzle` hooks provide easy access to Lichess's chess puzzles, puzzle activity, and performance dashboard in your React components. These hooks make it simple to incorporate tactical training and puzzle-solving features into your applications.

## Overview

Lichess offers thousands of chess puzzles for tactical training. The puzzle hooks allow you to:

- Fetch the daily puzzle or specific puzzles by ID
- Get personalized recommended puzzles based on user's rating
- Access puzzle solving history and activity
- View performance statistics through the puzzle dashboard

## usePuzzle

The primary hook for fetching and working with individual puzzles.

### Parameters

- `puzzleId`: (Optional) ID of a specific puzzle to fetch

### Returns

- `puzzle`: The puzzle data object, or null if not loaded
- `loading`: Boolean indicating if a puzzle is being fetched
- `error`: Error object if the fetch failed, otherwise null
- `refresh`: Function to reload the current puzzle
- `getRecommendedPuzzle`: Function to load a recommended puzzle (requires authentication)

### Behavior

- If `puzzleId` is provided, it fetches that specific puzzle
- If user is authenticated and no ID is provided, it fetches a recommended puzzle
- Otherwise, it fetches the daily puzzle

### Example

```jsx
import { usePuzzle } from '@/lib/lichess/hooks';

function PuzzleComponent({ puzzleId }) {
    const { puzzle, loading, error } = usePuzzle(puzzleId);
    
    if (loading) return <p>Loading puzzle...</p>;
    if (error) return <p>Error: {error.message}</p>;
    if (!puzzle) return <p>No puzzle found</p>;
    
    return (
        <div className="puzzle">
            <h3>Puzzle #{puzzle.id}</h3>
            <div className="puzzle-details">
                <p>Rating: {puzzle.rating}</p>
                <p>Theme: {puzzle.themes}</p>
            </div>
            
            {/* Render chess board with puzzle position */}
            <ChessBoard fen={puzzle.fen} />
            
            <div className="instructions">
                <p>{puzzle.color === 'white' ? 'White' : 'Black'} to move</p>
            </div>
        </div>
    );
}
```

### Loading Different Puzzles

```jsx
import { usePuzzle } from '@/lib/lichess/hooks';

function PuzzleTrainer() {
    const { puzzle, loading, getRecommendedPuzzle } = usePuzzle();
    
    // Load a new recommended puzzle
    const handleNextPuzzle = () => {
        getRecommendedPuzzle();
    };
    
    return (
        <div>
            {/* Puzzle display components */}
            
            <button onClick={handleNextPuzzle} disabled={loading}>
                Next Puzzle
            </button>
        </div>
    );
}
```

## usePuzzleActivity

Hook for fetching a user's puzzle solving history and activity.

### Parameters

- `max`: (Optional) Maximum number of activity entries to fetch, defaults to 100

### Returns

- `activity`: Array of puzzle activity entries
- `loading`: Boolean indicating if activity is being fetched
- `error`: Error object if the fetch failed, otherwise null
- `refresh`: Function to reload the activity data

### Authentication

This hook requires authentication. If the user is not authenticated, activity will remain an empty array.

### Example

```jsx
import { usePuzzleActivity } from '@/lib/lichess/hooks';

function PuzzleHistory() {
    const { activity, loading } = usePuzzleActivity(20); // Fetch last 20 puzzles
    
    if (loading) return <p>Loading activity...</p>;
    
    return (
        <div className="puzzle-history">
            <h3>Your Recent Puzzles</h3>
            
            {activity.length > 0 ? (
                <ul className="activity-list">
                    {activity.map(entry => (
                        <li key={entry.id} className={entry.win ? 'solved' : 'failed'}>
                            <span className="puzzle-id">#{entry.id}</span>
                            <span className="puzzle-rating">Rating: {entry.rating}</span>
                            <span className="result">
                                {entry.win ? '✓ Solved' : '✗ Failed'}
                            </span>
                            <span className="rating-change">
                                {entry.ratingDiff > 0 ? '+' : ''}{entry.ratingDiff}
                            </span>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No puzzle activity found. Try solving some puzzles!</p>
            )}
        </div>
    );
}
```

## usePuzzleDashboard

Hook for fetching the user's puzzle performance dashboard with statistics.

### Parameters

- `days`: (Optional) Number of days to include in the statistics, defaults to 30

### Returns

- `dashboard`: Dashboard data object or null if not loaded
- `loading`: Boolean indicating if dashboard is being fetched
- `error`: Error object if the fetch failed, otherwise null
- `refresh`: Function to reload the dashboard data

### Authentication

This hook requires authentication. If the user is not authenticated, dashboard will remain null.

### Example

```jsx
import { usePuzzleDashboard } from '@/lib/lichess/hooks';

function PuzzleDashboard() {
    const { dashboard, loading } = usePuzzleDashboard();
    
    if (loading) return <p>Loading dashboard...</p>;
    if (!dashboard) return <p>Dashboard not available</p>;
    
    return (
        <div className="puzzle-dashboard">
            <h3>Puzzle Performance</h3>
            
            <div className="stats-overview">
                <div className="stat-card">
                    <div className="stat-value">{dashboard.score}</div>
                    <div className="stat-label">Current Rating</div>
                </div>
                
                <div className="stat-card">
                    <div className="stat-value">{dashboard.solved}</div>
                    <div className="stat-label">Puzzles Solved</div>
                </div>
                
                <div className="stat-card">
                    <div className="stat-value">{dashboard.highestRating}</div>
                    <div className="stat-label">Highest Rating</div>
                </div>
            </div>
            
            {/* Add more dashboard visualization components here */}
        </div>
    );
}
```

## Puzzle Data Structure

The puzzle object typically includes the following properties:

```typescript
interface Puzzle {
    id: string;              // Unique puzzle ID
    fen: string;             // FEN notation of the puzzle position
    solution: string[];      // Solution moves in UCI format
    rating: number;          // Puzzle difficulty rating
    themes: string[];        // Puzzle themes (e.g., "mate", "fork", "pin")
    color: 'white' | 'black'; // Side to move
    plays: number;           // Number of times the puzzle has been played
    popularity: number;      // Popularity score
    gameUrl?: string;        // URL to the original game (if available)
    lines: object;           // Tree of possible variations and responses
}
```

## Puzzle Activity Structure

The activity entries typically include:

```typescript
interface PuzzleActivity {
    id: string;              // Puzzle ID
    date: number;            // Timestamp of the attempt
    rating: number;          // Puzzle rating
    userRating: number;      // User's puzzle rating at the time
    ratingDiff: number;      // Rating change after the attempt
    win: boolean;            // Whether the puzzle was solved correctly
}
```

## Dashboard Data Structure

The dashboard object typically includes:

```typescript
interface PuzzleDashboard {
    score: number;           // Current puzzle rating
    solved: number;          // Total puzzles solved
    attempted: number;       // Total puzzles attempted
    highestRating: number;   // Highest rating achieved
    history: {               // Rating history
        day: string;           // Date (YYYY-MM-DD)
        rating: number;        // Rating on that day
    }[];
    themes: {                // Performance by theme
        theme: string;         // Theme name
        count: number;         // Number of puzzles
        performance: number;   // Performance rating
    }[];
}
```

## Common Use Cases

### Puzzle Training Mode

```jsx
import { usePuzzle } from '@/lib/lichess/hooks';

function PuzzleTrainer() {
    const { puzzle, getRecommendedPuzzle } = usePuzzle();
    const [solved, setSolved] = useState(false);
    
    const handleMove = (move) => {
        // Check if move is correct
        // Update solved state accordingly
    };
    
    const handleNext = () => {
        setSolved(false);
        getRecommendedPuzzle();
    };
    
    return (
        <div>
            {/* Puzzle display components */}
            
            <button onClick={handleNext}>
                Next Puzzle
            </button>
        </div>
    );
}
```

### Key Use Cases

- **Implementing a Puzzle Training System**
  - Use `usePuzzle` to fetch puzzles tailored to the user's skill level
  - Track progress with `usePuzzleActivity` to show improvement over time
  - Display performance stats with `usePuzzleDashboard` to highlight strengths and weaknesses

- **Creating a Daily Puzzle Widget**
  - For unauthenticated users, the `usePuzzle` hook will return the daily puzzle, making it easy to create a daily challenge widget for your chess site or app.

- **Building a Theme-Based Training Program**
  - Use the theme information in the puzzle data to create focused training programs for specific tactical patterns (forks, pins, discovered attacks, etc.).

### Best Practices

- **Handle Authentication State**: Always consider both authenticated and unauthenticated states when using these hooks.
- **Error Handling**: Implement proper error handling, especially for the `getRecommendedPuzzle` function which requires authentication.
- **Loading States**: Display appropriate loading indicators during data fetching operations.
- **Puzzle Caching**: Consider caching puzzles on the client-side to reduce API calls, especially for the daily puzzle.
- **User Progress**: Save the user's progress on puzzles, particularly for multi-move puzzles where the solution may take time to complete.
- **Responsive Design**: Ensure your puzzle UI works well on both desktop and mobile screens, as many users solve puzzles on mobile devices.
- **Accessibility**: Make sure your puzzle interface is accessible to users with disabilities, including keyboard navigation and screen reader support.
