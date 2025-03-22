# useStudies Hooks

The `useStudies` hooks provide access to Lichess study functionality from your React components. These hooks enable you to fetch, display, and modify chess studies, which are collaborative analysis boards for saving, organizing, and sharing chess content.

## What are Lichess Studies?

Chess studies on Lichess are powerful tools for chess analysis, teaching, and collaboration. They allow users to:

- Create annotated chess content with multiple variations
- Organize analysis into chapters
- Collaborate with other players in real-time
- Share opening repertoires, tactical puzzles, or educational material
- Import and export PGN files

## Available Hooks

### `useStudy`

Fetches data for a specific study or study chapter.

**Parameters:**
- `studyId`: ID of the study to fetch (string or null)
- `chapterId`: (Optional) ID of a specific chapter to fetch

**Returns:**
- `pgn`: The PGN content of the study/chapter
- `metadata`: Metadata about the study
- `loading`: Boolean indicating if the study is being fetched
- `error`: Error object if the fetch failed, otherwise null
- `refresh`: Function to manually refresh the study data

**Example:**
```jsx
import { useStudy } from '@/lib/lichess/hooks';

function StudyViewer({ studyId, chapterId }) {
    const { pgn, metadata, loading, error } = useStudy(studyId, chapterId);
    
    if (loading) return <div>Loading study...</div>;
    if (error) return <div>Error loading study: {error.message}</div>;
    
    return (
        <div className="study-viewer">
            {metadata && (
                <div className="study-info">
                    <h2>{metadata.name}</h2>
                    <p>By {metadata.owner.name}</p>
                </div>
            )}
            
            {pgn && <ChessPgnViewer pgn={pgn} />}
        </div>
    );
}
```

### `useUserStudies`

Fetches all studies created by a specific user.

**Parameters:**
- `username`: Username of the study creator (string or null)

**Returns:**
- `studies`: Array of studies by the user
- `loading`: Boolean indicating if studies are being fetched
- `error`: Error object if the fetch failed, otherwise null
- `refresh`: Function to manually refresh the studies list

**Example:**
```jsx
import { useUserStudies } from '@/lib/lichess/hooks';

function UserStudiesList({ username }) {
    const { studies, loading, error } = useUserStudies(username);
    
    if (loading) return <div>Loading studies...</div>;
    
    return (
        <div className="studies-list">
            <h2>{username}'s Studies</h2>
            
            {error ? (
                <div className="error">Error: {error.message}</div>
            ) : studies.length > 0 ? (
                <ul>
                    {studies.map(study => (
                        <li key={study.id}>
                            <a href={`/study/${study.id}`}>{study.name}</a>
                            <span>{study.chapters.length} chapters</span>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No studies found.</p>
            )}
        </div>
    );
}
```

### `useStudyActions`

Provides functions for manipulating studies (requires authentication).

**Returns:**
- `loading`: Boolean indicating if an action is in progress
- `error`: Error object if the action failed, otherwise null
- `importPgn`: Function to import PGN content to a study
- `deleteChapter`: Function to delete a chapter from a study

**Example:**
```jsx
import { useStudyActions } from '@/lib/lichess/hooks';
import { useState } from 'react';

function PgnImporter({ studyId }) {
    const { importPgn, loading, error } = useStudyActions();
    const [pgn, setPgn] = useState('');
    
    const handleImport = async () => {
        try {
            await importPgn(studyId, pgn, {
                name: 'Imported chapter',
                mode: 'normal'
            });
            setPgn('');
            alert('PGN imported successfully!');
        } catch (err) {
            console.error('Import failed:', err);
        }
    };
    
    return (
        <div className="pgn-importer">
            <h3>Import PGN</h3>
            {error && <div className="error">{error.message}</div>}
            
            <textarea 
                value={pgn}
                onChange={e => setPgn(e.target.value)}
                placeholder="Paste PGN here..."
                rows={10}
            />
            
            <button 
                onClick={handleImport}
                disabled={loading || !pgn.trim()}
            >
                {loading ? 'Importing...' : 'Import PGN'}
            </button>
        </div>
    );
}
```

## Use Cases

### Opening Repertoire Browser

Create a component that displays a user's opening repertoire studies:
```jsx
function OpeningRepertoire({ username }) {
    const { studies } = useUserStudies(username);
    
    const openingStudies = studies.filter(study => 
        study.tags?.genre === 'opening' || 
        study.name.toLowerCase().includes('opening')
    );
    
    return (
        <div className="opening-repertoire">
            <h2>Opening Repertoire</h2>
            {/* Display filtered studies */}
        </div>
    );
}
```

### Study Chapter Navigator

Create a component that allows navigation between chapters in a study:
```jsx
function ChapterNavigator({ studyId }) {
    const { metadata, loading } = useStudy(studyId);
    const [activeChapter, setActiveChapter] = useState(null);
    
    // When study metadata loads, set the first chapter as active
    useEffect(() => {
        if (metadata?.chapters?.length > 0) {
            setActiveChapter(metadata.chapters[0].id);
        }
    }, [metadata]);
    
    // Then use the active chapter to fetch the specific chapter content
    const { pgn } = useStudy(studyId, activeChapter);
    
    // Render chapter list and content
}
```

### PGN Export Tool

Create a component for exporting study content:
```jsx
function PgnExporter({ studyId }) {
    const { pgn, metadata } = useStudy(studyId);
    
    const handleDownload = () => {
        const filename = `${metadata?.name || 'study'}.pgn`;
        const blob = new Blob([pgn || ''], { type: 'application/x-chess-pgn' });
        const url = URL.createObjectURL(blob);
        
        // Create download link and trigger download
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        
        URL.revokeObjectURL(url);
    };
    
    return (
        <button onClick={handleDownload} disabled={!pgn}>
            Download PGN
        </button>
    );
}
```

## Study Metadata Structure

The study metadata typically includes:
```typescript
interface StudyMetadata {
    id: string;        // Study ID
    name: string;      // Study name
    owner: {           // Study owner
        id: string;      // Owner's Lichess ID
        name: string;    // Owner's username
    };
    visibility: 'public' | 'private' | 'unlisted';
    createdAt: number; // Creation timestamp
    updatedAt: number; // Last update timestamp
    likes: number;     // Number of likes
    isLiked: boolean;  // Whether the current user has liked it
    tags: {            // Custom tags
        [key: string]: string;
    };
    chapters: {        // Array of chapters
        id: string;      // Chapter ID
        name: string;    // Chapter name
        orientation: 'white' | 'black';
    }[];
    members: {         // Study collaborators
        user: {
            id: string;
            name: string;
        };
        role: 'contributor' | 'viewer';
    }[];
}
```

## Important Notes

- **Authentication**: Many study-related actions, including importing PGN and deleting chapters, require authentication.
- **Study Permissions**: Access to private studies is restricted to the owner and collaborators. Make sure your components handle permission errors gracefully.
- **PGN Format**: The PGN returned by these hooks follows standard PGN notation but may include Lichess-specific annotations.
- **Real-time Updates**: These hooks don't provide real-time updates for collaborative editing. For real-time collaboration, consider using the Lichess studies socket API.
- **Error Handling**: Always implement proper error handling to provide feedback when operations fail, especially for authenticated actions.