# Puzzles API

The Puzzles API provides functions for accessing and interacting with Lichess puzzles, including the daily puzzle, puzzle recommendations, and puzzle activity tracking.

## Overview

Chess puzzles are an excellent way to improve tactical skills. This API allows you to:

- Access the daily puzzle
- Get specific puzzles by ID
- Get personalized puzzle recommendations
- Track puzzle solving activity
- View puzzle solving statistics

## Functions

### `getDailyPuzzle(options?)`

Fetches the daily puzzle from Lichess.

**Authentication Required**: No

**Parameters:**
- `options`: (Optional) Request options
    - `noCache`: Set to `true` to bypass cache

**Returns:**
A Promise that resolves to the daily puzzle data or `null` on error.

**Example:**
```typescript
import { getDailyPuzzle } from '@/lib/lichess/api';

// Get the daily puzzle
const puzzle = await getDailyPuzzle();

if (puzzle) {
    console.log(`Puzzle ID: ${puzzle.puzzle.id}`);
    console.log(`Initial FEN: ${puzzle.game.fen}`);
    console.log(`Puzzle Rating: ${puzzle.puzzle.rating}`);
}
```

### `getPuzzleById(puzzleId, options?)`

Fetches a specific puzzle by its ID.

**Authentication Required**: No

**Parameters:**
- `puzzleId`: The ID of the puzzle to fetch
- `options`: (Optional) Request options
    - `noCache`: Set to `true` to bypass cache

**Returns:**
A Promise that resolves to the puzzle data or `null` on error.

**Example:**
```typescript
import { getPuzzleById } from '@/lib/lichess/api';

// Get a specific puzzle by ID
const puzzle = await getPuzzleById('abcdef');

if (puzzle) {
    console.log(`Puzzle theme: ${puzzle.puzzle.themes.join(', ')}`);
    console.log(`Solution: ${puzzle.puzzle.solution.join(', ')}`);
}
```

### `getNextPuzzle(options?)`

Gets a puzzle recommendation based on the authenticated user's level. This function will return a puzzle appropriate for the user's rating.

**Authentication Required**: Yes

**Parameters:**
- `options`: (Optional) Request options
    - `noCache`: Set to `true` to bypass cache

**Returns:**
A Promise that resolves to the recommended puzzle data or `null` if not authenticated or on error.

**Example:**
```typescript
import { getNextPuzzle } from '@/lib/lichess/api';

// Get a recommended puzzle
const puzzle = await getNextPuzzle();

if (puzzle) {
    console.log(`Recommended puzzle ID: ${puzzle.puzzle.id}`);
    console.log(`This puzzle is rated ${puzzle.puzzle.rating}`);
    console.log(`Your current puzzle rating: ${puzzle.user.rating}`);
} else {
    console.log('Please log in to get personalized puzzle recommendations');
}
```

### `getPuzzleActivity(max?)`

Fetches the authenticated user's puzzle solving activity.

**Authentication Required**: Yes

**Parameters:**
- `max`: (Optional) Maximum number of activity entries to fetch

**Returns:**
A Promise that resolves to an array of puzzle activity data or an empty array if not authenticated or on error.

**Example:**
```typescript
import { getPuzzleActivity } from '@/lib/lichess/api';

// Get the last 10 puzzle solving activities
const activities = await getPuzzleActivity(10);

if (activities.length > 0) {
    activities.forEach(activity => {
        console.log(`Puzzle ${activity.id}: ${activity.win ? 'Solved' : 'Failed'}`);
        console.log(`Rating change: ${activity.ratingDiff > 0 ? '+' : ''}${activity.ratingDiff}`);
    });
} else {
    console.log('No puzzle activity found or not logged in');
}
```

### `getPuzzleDashboard(days?)`

Fetches the authenticated user's puzzle dashboard statistics for a specified period.

**Authentication Required**: Yes

**Parameters:**
- `days`: (Optional) Number of days to include in the dashboard, defaults to 30

**Returns:**
A Promise that resolves to the puzzle dashboard data or `null` if not authenticated or on error.

**Example:**
```typescript
import { getPuzzleDashboard } from '@/lib/lichess/api';

// Get puzzle statistics for the last 7 days
const dashboard = await getPuzzleDashboard(7);

if (dashboard) {
    console.log(`Puzzles solved: ${dashboard.nb}`);
    console.log(`Success rate: ${dashboard.performance.winPercent}%`);
    console.log(`Rating progress: ${dashboard.performance.ratingDiff > 0 ? '+' : ''}${dashboard.performance.ratingDiff}`);
    
    // Log theme performance
    if (dashboard.themes) {
        console.log('Performance by theme:');
        Object.entries(dashboard.themes).forEach(([theme, stats]) => {
            console.log(`${theme}: ${stats.winPercent}% success (${stats.nb} puzzles)`);
        });
    }
} else {
    console.log('Please log in to view your puzzle dashboard');
}
```

## Response Data Structures

### Puzzle Data

The puzzle data returned by these functions typically includes:
```typescript
interface PuzzleData {
    // General puzzle data
    puzzle: {
        id: string;
        rating: number;
        plays: number;
        initialPly: number;
        solution: string[];
        themes: string[];
    };
    
    // Game context data
    game: {
        id: string;
        pgn: string;
        fen: string;
        players: {
            white: { name: string; rating: number };
            black: { name: string; rating: number };
        };
    };
    
    // For authenticated requests
    user?: {
        rating: number;
        provisional: boolean;
    };
}
```

### Puzzle Activity Data

The puzzle activity data includes:
```typescript
interface PuzzleActivity {
    id: string;
    date: number; // Timestamp
    win: boolean;
    rating: number;
    ratingDiff: number;
}
```

### Puzzle Dashboard Data

The puzzle dashboard data includes:
```typescript
interface PuzzleDashboard {
    nb: number; // Number of puzzles solved
    firstWins: number; // Number of puzzles solved on first attempt
    performance: {
        win: number; // Number of wins
        draw: number; // Number of failed attempts
        loss: number; // Number of losses
        ratingDiff: number; // Rating change
        winPercent: number; // Success rate
    };
    themes?: Record<string, {
        nb: number;
        win: number;
        winPercent: number;
    }>;
    days?: Record<string, {
        nb: number;
        win: number;
        winPercent: number;
        ratingDiff: number;
    }>;
}
```

## Common Use Cases

### Daily Puzzle Component

```typescript
import { getDailyPuzzle } from '@/lib/lichess/api';
import { useState, useEffect } from 'react';

function DailyPuzzle() {
    const [puzzle, setPuzzle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showSolution, setShowSolution] = useState(false);
    
    useEffect(() => {
        async function loadPuzzle() {
            try {
                setLoading(true);
                const data = await getDailyPuzzle();
                
                if (data) {
                    setPuzzle(data);
                } else {
                    setError(new Error('Failed to load puzzle'));
                }
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        }
        
        loadPuzzle();
    }, []);
    
    if (loading) return <div>Loading daily puzzle...</div>;
    if (error) return <div>Error: {error.message}</div>;
    if (!puzzle) return <div>No puzzle available</div>;
    
    return (
        <div className="daily-puzzle">
            <h2>Daily Puzzle</h2>
            <div className="puzzle-info">
                <p>Rating: {puzzle.puzzle.rating}</p>
                <p>Themes: {puzzle.puzzle.themes.join(', ')}</p>
            </div>
            
            <div className="puzzle-board">
                {/* Use your preferred chess board component */}
                <ChessBoard 
                    fen={puzzle.game.fen} 
                    orientation={puzzle.game.fen.includes(' w ') ? 'white' : 'black'} 
                />
            </div>
            
            <button onClick={() => setShowSolution(!showSolution)}>
                {showSolution ? 'Hide Solution' : 'Show Solution'}
            </button>
            
            {showSolution && (
                <div className="solution">
                    <h3>Solution</h3>
                    <ol>
                        {puzzle.puzzle.solution.map((move, index) => (
                            <li key={index}>{move}</li>
                        ))}
                    </ol>
                </div>
            )}
            
            <a 
                href={`https://lichess.org/training/${puzzle.puzzle.id}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="lichess-link"
            >
                Solve on Lichess
            </a>
        </div>
    );
}
```

### Puzzle Training Session

```typescript
import { getNextPuzzle } from '@/lib/lichess/api';
import { useAuth } from '@/lib/lichess/hooks';
import { useState, useEffect } from 'react';

function PuzzleTraining() {
    const { isAuthenticated, login } = useAuth();
    const [puzzle, setPuzzle] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    async function loadNextPuzzle() {
        if (!isAuthenticated) return;
        
        try {
            setLoading(true);
            setError(null);
            
            const data = await getNextPuzzle();
            
            if (data) {
                setPuzzle(data);
            } else {
                setError(new Error('Failed to load puzzle'));
            }
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    }
    
    useEffect(() => {
        if (isAuthenticated) {
            loadNextPuzzle();
        }
    }, [isAuthenticated]);
    
    if (!isAuthenticated) {
        return (
            <div className="puzzle-training">
                <h2>Puzzle Training</h2>
                <p>Please log in to access personalized puzzle training</p>
                <button onClick={login}>Login with Lichess</button>
            </div>
        );
    }
    
    if (loading) return <div>Loading puzzle...</div>;
    if (error) return <div>Error: {error.message}</div>;
    if (!puzzle) return <div>No puzzle available</div>;
    
    return (
        <div className="puzzle-training">
            <h2>Puzzle Training</h2>
            <div className="puzzle-info">
                <p>Your rating: {puzzle.user.rating}</p>
                <p>Puzzle rating: {puzzle.puzzle.rating}</p>
            </div>
            
            <div className="puzzle-board">
                {/* Implement an interactive puzzle solving component */}
                <InteractivePuzzleBoard 
                    puzzle={puzzle}
                    onSolved={() => {
                        // Handle puzzle completion
                        loadNextPuzzle();
                    }}
                />
            </div>
            
            <button onClick={loadNextPuzzle} disabled={loading}>
                Skip to Next Puzzle
            </button>
        </div>
    );
}

// Note: InteractivePuzzleBoard would be a custom component that
// allows users to make moves and checks if they match the solution
```

### Puzzle Progress Tracker

```typescript
import { getPuzzleDashboard, getPuzzleActivity } from '@/lib/lichess/api';
import { useAuth } from '@/lib/lichess/hooks';
import { useState, useEffect } from 'react';

function PuzzleProgressTracker() {
    const { isAuthenticated, login } = useAuth();
    const [dashboard, setDashboard] = useState(null);
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [timeFrame, setTimeFrame] = useState(7); // days
    
    useEffect(() => {
        if (!isAuthenticated) return;
        
        async function loadData() {
            try {
                setLoading(true);
                setError(null);
                
                // Fetch dashboard and activity data in parallel
                const [dashboardData, activityData] = await Promise.all([
                    getPuzzleDashboard(timeFrame),
                    getPuzzleActivity(20)
                ]);
                
                setDashboard(dashboardData);
                setActivities(activityData);
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        }
        
        loadData();
    }, [isAuthenticated, timeFrame]);
    
    if (!isAuthenticated) {
        return (
            <div className="puzzle-progress">
                <h2>Puzzle Progress</h2>
                <p>Please log in to view your puzzle progress</p>
                <button onClick={login}>Login with Lichess</button>
            </div>
        );
    }
    
    if (loading) return <div>Loading your puzzle data...</div>;
    if (error) return <div>Error: {error.message}</div>;
    
    return (
        <div className="puzzle-progress">
            <h2>Your Puzzle Progress</h2>
            
            <div className="time-selector">
                <label>Time period: </label>
                <select 
                    value={timeFrame} 
                    onChange={(e) => setTimeFrame(Number(e.target.value))}
                >
                    <option value={7}>Last 7 days</option>
                    <option value={30}>Last 30 days</option>
                    <option value={90}>Last 3 months</option>
                </select>
            </div>
            
            {dashboard && (
                <div className="dashboard-stats">
                    <div className="stat">
                        <h3>Puzzles Solved</h3>
                        <p className="value">{dashboard.nb}</p>
                    </div>
                    
                    <div className="stat">
                        <h3>Success Rate</h3>
                        <p className="value">{dashboard.performance.winPercent}%</p>
                    </div>
                    
                    <div className="stat">
                        <h3>Rating Change</h3>
                        <p className={`value ${dashboard.performance.ratingDiff > 0 ? 'positive' : dashboard.performance.ratingDiff < 0 ? 'negative' : ''}`}>
                            {dashboard.performance.ratingDiff > 0 ? '+' : ''}
                            {dashboard.performance.ratingDiff}
                        </p>
                    </div>
                </div>
            )}
            
            {activities.length > 0 && (
                <div className="recent-activities">
                    <h3>Recent Puzzles</h3>
                    <ul>
                        {activities.map(activity => (
                            <li key={activity.id} className={activity.win ? 'win' : 'loss'}>
                                <a 
                                    href={`https://lichess.org/training/${activity.id}`}
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                >
                                    Puzzle {activity.id}
                                </a>
                                <span className="result">{activity.win ? 'Solved' : 'Failed'}</span>
                                <span className={`rating-change ${activity.ratingDiff > 0 ? 'positive' : activity.ratingDiff < 0 ? 'negative' : ''}`}>
                                    {activity.ratingDiff > 0 ? '+' : ''}
                                    {activity.ratingDiff}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
```
