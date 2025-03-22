# Studies API

The Studies API provides functions for working with Lichess studies, which are collections of annotated chess games or positions. This API allows you to create, read, update, and delete study content.

## Overview

Lichess studies are powerful tools for chess analysis, teaching, and sharing chess content. Each study consists of multiple chapters, and each chapter contains a game or position with variations and annotations. The Studies API enables:

- Exporting studies and chapters in PGN format
- Importing PGN content into studies
- Managing study chapters
- Listing studies by user

## Functions

### `exportStudyChapter(studyId, chapterId, options?)`

Exports one chapter of a study in PGN format.

**Parameters:**
- `studyId`: Study ID
- `chapterId`: Chapter ID
- `options`: (Optional) Export options
    - `comments`: Whether to include comments (boolean)
    - `variations`: Whether to include variations (boolean)
    - `opening`: Whether to include opening names (boolean)
    - `clocks`: Whether to include clock information (boolean)
    - `orientation`: Board orientation ('white' or 'black')

**Returns:**
A Promise that resolves to the PGN string or `null` on error.

**Example:**
```typescript
import { exportStudyChapter } from '@/lib/lichess/api';

// Export a specific chapter with all annotations
const pgn = await exportStudyChapter('abc123def456', 'xyz789', {
    comments: true,
    variations: true,
    opening: true
});

if (pgn) {
    console.log('Successfully exported chapter PGN:');
    console.log(pgn.substring(0, 100) + '...');
}
```

### `exportStudy(studyId, options?)`

Exports all chapters of a study in PGN format.

**Parameters:**
- `studyId`: Study ID
- `options`: (Optional) Same export options as `exportStudyChapter`

**Returns:**
A Promise that resolves to the PGN string or `null` on error.

**Example:**
```typescript
import { exportStudy } from '@/lib/lichess/api';

// Export an entire study without variations
const pgn = await exportStudy('abc123def456', {
    comments: true,
    variations: false,
    opening: true
});

if (pgn) {
    console.log(`Exported study PGN (${pgn.length} characters)`);
    // Save to file, display in UI, etc.
}
```

### `getStudyMetadata(studyId)`

Gets metadata for a study, including the last modification time.

**Parameters:**
- `studyId`: Study ID

**Returns:**
A Promise that resolves to an object containing metadata or `null` on error.

**Example:**
```typescript
import { getStudyMetadata } from '@/lib/lichess/api';

// Check when a study was last modified
const metadata = await getStudyMetadata('abc123def456');

if (metadata) {
    console.log(`Last modified: ${metadata.lastModified}`);
    
    // Use for caching decisions
    const lastModifiedDate = new Date(metadata.lastModified);
    const isRecent = (Date.now() - lastModifiedDate.getTime()) < 3600000; // 1 hour
    
    if (isRecent) {
        console.log('Study was recently updated');
    }
}
```

### `importPgnToStudy(studyId, pgn, options?)`

Imports PGN content into an existing study.

**Authentication Required:** Yes

**Parameters:**
- `studyId`: Study ID
- `pgn`: PGN content as a string
- `options`: (Optional) Import options
    - `name`: Chapter name
    - `variant`: Chess variant
    - `mode`: Study mode ('normal', 'practice', 'conceal', 'gamebook')
    - `initial`: Whether to set as initial position
    - `sticky`: Whether to make the chapter sticky

**Returns:**
A Promise that resolves to the import result or throws an error.

**Example:**
```typescript
import { importPgnToStudy } from '@/lib/lichess/api';

// Import a famous game as a new chapter
try {
    const pgn = `[Event "World Chess Championship"]
[Site "New York, NY USA"]
[Date "1972.07.11"]
[Round "1"]
[White "Spassky, Boris V"]
[Black "Fischer, Robert James"]
[Result "1-0"]

1. d4 Nf6 2. c4 e6 3. Nf3 d5 4. Nc3 Bb4 5. e3 O-O 6. Bd3 c5 7. O-O Nc6 8. a3 Ba5 9. Ne2 dxc4 10. Bxc4 Bb6 11. dxc5 Qxd1 12. Rxd1 Bxc5 13. b4 Be7 14. Bb2 Bd7 15. Rac1 Rfd8 16. Ned4 Nxd4 17. Nxd4 Ba4 18. Bb3 Bxb3 19. Nxb3 Rxd1+ 20. Rxd1 Rc8 21. Kf1 Kf8 22. Ke2 Ne4 23. Rc1 Rxc1 24. Bxc1 f6 25. Na5 Nd6 26. Kd3 Bd8 27. Nc4 Bc7 28. Nxd6 Bxd6 29. b5 Bxh2 30. g3 h5 31. Ke4 h4 32. f4 hxg3 33. Kf3 1-0`;

    const result = await importPgnToStudy('abc123def456', pgn, {
        name: 'Fischer vs Spassky - Game 1',
        mode: 'normal'
    });
    
    console.log('Chapter imported successfully', result);
} catch (error) {
    console.error('Failed to import chapter:', error);
}
```

### `exportUserStudies(username, options?)`

Exports all studies of a user in PGN format.

**Parameters:**
- `username`: Username to export studies for
- `options`: (Optional) Same export options as `exportStudy`

**Returns:**
A Promise that resolves to the PGN string or `null` on error.

**Example:**
```typescript
import { exportUserStudies } from '@/lib/lichess/api';

// Export all studies from a user
const pgn = await exportUserStudies('DrNykterstein', {
    comments: true,
    variations: true
});

if (pgn) {
    console.log(`Exported ${pgn.split('[Event').length - 1} games from user's studies`);
    
    // Save to file for offline study
    // saveToFile(pgn, 'magnus_studies.pgn');
}
```

### `listUserStudies(username)`

Lists metadata of all studies created by a user.

**Parameters:**
- `username`: Username to list studies for

**Returns:**
A Promise that resolves to an array of study metadata objects or `null` on error.

**Example:**
```typescript
import { listUserStudies } from '@/lib/lichess/api';

// Get list of all studies by a user
const studies = await listUserStudies('DrNykterstein');

if (studies) {
    console.log(`Found ${studies.length} studies`);
    
    // Print study details
    studies.forEach(study => {
        console.log(`"${study.name}" by ${study.owner.name} - ${study.chapters.length} chapters`);
        console.log(`Created: ${new Date(study.createdAt).toLocaleDateString()}`);
        console.log(`Topics: ${study.topics.join(', ')}`);
        console.log(`URL: https://lichess.org/study/${study.id}`);
        console.log('---');
    });
    
    // Find studies on specific openings
    const sicilianStudies = studies.filter(s => 
        s.name.toLowerCase().includes('sicilian') || 
        s.topics.some(t => t.toLowerCase().includes('sicilian'))
    );
    
    console.log(`Found ${sicilianStudies.length} Sicilian studies`);
}
```

### `deleteStudyChapter(studyId, chapterId)`

Deletes a chapter from a study.

**Authentication Required:** Yes

**Parameters:**
- `studyId`: Study ID
- `chapterId`: Chapter ID to delete

**Returns:**
A Promise that resolves to true on success or throws an error.

**Example:**
```typescript
import { deleteStudyChapter } from '@/lib/lichess/api';

// Delete a study chapter
try {
    const success = await deleteStudyChapter('abc123def456', 'xyz789');
    
    if (success) {
        console.log('Chapter deleted successfully');
    }
} catch (error) {
    console.error('Failed to delete chapter:', error);
    // Check if it's a permission error
    if (error.message.includes('Forbidden')) {
        console.error('You do not have permission to delete this chapter');
    }
}
```

## Response Data Structures

### Study Metadata

The study metadata returned by `listUserStudies` typically includes:
```typescript
interface StudyMetadata {
    id: string;
    name: string;
    owner: {
        id: string;
        name: string;
    };
    chapters: Array<{
        id: string;
        name: string;
    }>;
    likes: number;
    createdAt: number;
    updatedAt: number;
    topics: string[];
    public: boolean;
    visibility: 'public' | 'unlisted' | 'private';
}
```

## Common Use Cases

### Study Browser Component

```typescript
import { listUserStudies, exportStudyChapter } from '@/lib/lichess/api';
import { useState, useEffect } from 'react';

function StudyBrowser({ username }) {
    const [studies, setStudies] = useState([]);
    const [selectedStudy, setSelectedStudy] = useState(null);
    const [selectedChapter, setSelectedChapter] = useState(null);
    const [pgn, setPgn] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    useEffect(() => {
        async function loadStudies() {
            try {
                setLoading(true);
                const studiesData = await listUserStudies(username);
                
                if (studiesData) {
                    setStudies(studiesData);
                    if (studiesData.length > 0) {
                        setSelectedStudy(studiesData[0]);
                        if (studiesData[0].chapters.length > 0) {
                            setSelectedChapter(studiesData[0].chapters[0]);
                        }
                    }
                } else {
                    setError(new Error('Failed to load studies'));
                }
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        }
        
        if (username) {
            loadStudies();
        }
    }, [username]);
    
    useEffect(() => {
        async function loadChapter() {
            if (!selectedStudy || !selectedChapter) return;
            
            try {
                setLoading(true);
                const chapterPgn = await exportStudyChapter(
                    selectedStudy.id, 
                    selectedChapter.id,
                    { comments: true, variations: true, opening: true }
                );
                
                setPgn(chapterPgn);
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        }
        
        loadChapter();
    }, [selectedStudy, selectedChapter]);
    
    if (loading && !studies.length) return <div>Loading studies...</div>;
    if (error) return <div>Error: {error.message}</div>;
    if (!studies.length) return <div>No studies found for user {username}</div>;
    
    return (
        <div className="study-browser">
            <div className="study-list">
                <h2>Studies by {username}</h2>
                <select
                    value={selectedStudy?.id || ''}
                    onChange={(e) => {
                        const study = studies.find(s => s.id === e.target.value);
                        setSelectedStudy(study);
                        if (study?.chapters.length > 0) {
                            setSelectedChapter(study.chapters[0]);
                        } else {
                            setSelectedChapter(null);
                        }
                    }}
                >
                    {studies.map(study => (
                        <option key={study.id} value={study.id}>
                            {study.name} ({study.chapters.length} chapters)
                        </option>
                    ))}
                </select>
            </div>
            
            {selectedStudy && (
                <div className="chapter-list">
                    <h3>Chapters</h3>
                    <select
                        value={selectedChapter?.id || ''}
                        onChange={(e) => {
                            const chapter = selectedStudy.chapters.find(c => c.id === e.target.value);
                            setSelectedChapter(chapter);
                        }}
                    >
                        {selectedStudy.chapters.map(chapter => (
                            <option key={chapter.id} value={chapter.id}>
                                {chapter.name}
                            </option>
                        ))}
                    </select>
                </div>
            )}
            
            {pgn && (
                <div className="pgn-viewer">
                    <h3>{selectedChapter?.name}</h3>
                    {loading ? (
                        <div>Loading chapter...</div>
                    ) : (
                        <ChessBoardComponent pgn={pgn} />
                    )}
                </div>
            )}
        </div>
    );
}
```

### Study Backup Tool

```typescript
import { listUserStudies, exportStudy } from '@/lib/lichess/api';
import { useState } from 'react';

function StudyBackupTool() {
  const [username, setUsername] = useState('');
  const [studies, setStudies] = useState([]);
  const [selectedStudyIds, setSelectedStudyIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [backupReady, setBackupReady] = useState(false);
  const [combinedPgn, setCombinedPgn] = useState('');
  
  async function loadStudies() {
    if (!username.trim()) return;
    
    try {
      setLoading(true);
      setError(null);
      setStudies([]);
      setSelectedStudyIds([]);
      setBackupReady(false);
      
      const studiesData = await listUserStudies(username);
      
      if (studiesData) {
        setStudies(studiesData);
        // Select all studies by default
        setSelectedStudyIds(studiesData.map(s => s.id));
      } else {
        setError(new Error(`No studies found or user '${username}' does not exist`));
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }
  
  async function createBackup() {
    try {
      setLoading(true);
      setError(null);
      setBackupReady(false);
      
      let allPgn = '';
      
      // Get PGN for each selected study
      for (const studyId of selectedStudyIds) {
        const study = studies.find(s => s.id === studyId);
        const pgn = await exportStudy(studyId, {
          comments: true,
          variations: true,
          opening: true
        });
        
        if (pgn) {
          // Add separator between studies
          if (allPgn) allPgn += '\n\n';
          
          // Add study name as a comment
          allPgn += `% Study: ${study.name}\n`;
          allPgn += pgn;
        }
      }
      
      setCombinedPgn(allPgn);
      setBackupReady(true);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }
  
  function downloadPgn() {
    if (!combinedPgn) return;
    
    const blob = new Blob([combinedPgn], { type: 'application/x-chess-pgn' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${username}-studies-backup.pgn`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
  
  return (
    <div className="study-backup-tool">
      <h2>Lichess Study Backup Tool</h2>
      
      <div className="username-form">
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Lichess username"
        />
        <button 
          onClick={loadStudies} 
          disabled={loading || !username.trim()}
        >
          Load Studies
        </button>
      </div>
      
      {error && <div className="error">{error.message}</div>}
      
      {studies.length > 0 && (
        <div className="study-selection">
          <h3>Select Studies to Backup ({selectedStudyIds.length}/{studies.length})</h3>
          
          <div className="select-controls">
            <button 
              onClick={() => setSelectedStudyIds(studies.map(s => s.id))}
              disabled={loading}
            >
              Select All
            </button>
            <button 
              onClick={() => setSelectedStudyIds([])}
              disabled={loading}
            >
              Deselect All
            </button>
          </div>
          
          <div className="study-list">
            {studies.map(study => (
              <div key={study.id} className="study-item">
                <label>
                  <input
                    type="checkbox"
                    checked={selectedStudyIds.includes(study.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedStudyIds([...selectedStudyIds, study.id]);
                      } else {
                        setSelectedStudyIds(selectedStudyIds.filter(id => id !== study.id));
                      }
                    }}
                    disabled={loading}
                  />
                  {study.name} ({study.chapters.length} chapters)
                </label>
                <span className="study-date">
                  {new Date(study.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
          
          <button
            onClick={createBackup}
            disabled={loading || selectedStudyIds.length === 0}
            className="create-backup-button"
          >
            {loading ? 'Creating Backup...' : 'Create Backup'}
          </button>
        </div>
      )}
      
      {backupReady && (
        <div className="backup-ready">
          <h3>Backup Ready!</h3>
          <p>
            {selectedStudyIds.length} studies with {combinedPgn.split('[Event').length - 1} total games/positions 
            have been prepared for download.
          </p>
          <button onClick={downloadPgn} className="download-button">
            Download PGN File
          </button>
        </div>
      )}
    </div>
  );
}
```