# Analysis API

The Analysis API provides functions for analyzing chess positions using Lichess's cloud evaluation and tablebase services.

## Overview

Chess analysis is a critical part of chess improvement and preparation. This API module offers:

- **Cloud Evaluation**: Access to Lichess's distributed cloud evaluation service
- **Tablebase Access**: Look up perfect play information for positions with 7 or fewer pieces

## Functions

### `getCloudEval(fen, multiPv?, variant?)`

Gets cloud evaluation for a chess position from Lichess's distributed analysis system.

**Parameters:**
- `fen`: FEN string representation of the position
- `multiPv`: (Optional) Number of principal variations to return (1-5), defaults to 1
- `variant`: (Optional) Variant of the game (e.g., 'standard', 'chess960'), defaults to 'standard'

**Returns:**
A Promise that resolves to the evaluation data or `null` if the position has not been analyzed or on error.

**Example:**
```typescript
import { getCloudEval } from '@/lib/lichess/api';

// Get evaluation for the starting position
const eval = await getCloudEval('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');

if (eval) {
    console.log(`Evaluation: ${eval.pvs[0].cp / 100} pawns`);
    console.log(`Best move: ${eval.pvs[0].moves.split(' ')[0]}`);
    console.log(`Depth: ${eval.depth}`);
} else {
    console.log('Position not found in cloud or error occurred');
}

// Get multiple principal variations
const multipleLines = await getCloudEval(
    'r1bqkbnr/ppp2ppp/2np4/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 4',
    3
);

if (multipleLines) {
    console.log(`Found ${multipleLines.pvs.length} variations`);
    multipleLines.pvs.forEach((pv, i) => {
        console.log(`Line ${i+1}: ${pv.moves.split(' ').slice(0, 5).join(' ')} (${pv.cp / 100})`);
    });
}
```

### `getTablebase(fen)`

Fetches perfect play information from the Lichess tablebase for positions with 7 or fewer pieces.

**Parameters:**
- `fen`: FEN string representation of the position

**Returns:**
A Promise that resolves to the tablebase lookup data or `null` on error.

**Example:**
```typescript
import { getTablebase } from '@/lib/lichess/api';

// Look up a king and pawn endgame
const result = await getTablebase('8/8/8/8/8/k7/4P3/7K w - - 0 1');

if (result) {
    console.log(`Position category: ${result.category}`);
    console.log(`Best move: ${result.moves[0].san}`);
    console.log(`Outcome with best play: ${result.moves[0].dtz === 0 ? 'Draw' : 'Win in ' + Math.abs(result.moves[0].dtz) + ' moves to zeroing'}`);
    
    // Check if position is a win, loss, or draw with perfect play
    if (result.checkmate) {
        console.log('Position is checkmate');
    } else if (result.stalemate) {
        console.log('Position is stalemate');
    } else if (result.insufficient_material) {
        console.log('Position has insufficient material for checkmate');
    } else if (result.moves.some(m => m.wdl < 0)) {
        console.log('Position is losing with perfect play');
    } else if (result.moves.some(m => m.wdl > 0)) {
        console.log('Position is winning with perfect play');
    } else {
        console.log('Position is a draw with perfect play');
    }
}
```

## Response Data Structures

### Cloud Evaluation Response

The cloud evaluation response typically includes:
```typescript
interface CloudEvalResponse {
    /** Evaluation in centipawns or mate score */
    pvs: Array<{
        /** Centipawn evaluation (positive = white advantage) */
        cp?: number;
        /** Mate in X moves (positive = white wins, negative = black wins) */
        mate?: number;
        /** Principal variation (sequence of best moves) */
        moves: string;
    }>;
    /** Search depth */
    depth: number;
    /** Search depth including selective extensions */
    knodes: number;
    /** FEN of the evaluated position */
    fen: string;
}
```

### Tablebase Response

The tablebase response typically includes:
```typescript
interface TablebaseResponse {
    /** Success or failure */
    success: boolean;
    /** Position category (e.g., "win", "loss", "draw") */
    category?: string;
    /** Whether the position is checkmate */
    checkmate?: boolean;
    /** Whether the position is stalemate */
    stalemate?: boolean;
    /** Whether the position has insufficient material */
    insufficient_material?: boolean;
    /** Available moves */
    moves?: Array<{
        /** Move in UCI format */
        uci: string;
        /** Move in SAN format */
        san: string;
        /** Win/Draw/Loss value (-2 to 2) */
        wdl: number;
        /** Distance to zeroing (conversion or capture) */
        dtz: number;
        /** Distance to mate */
        dtm?: number;
        /** Whether this move is optimal */
        optimal: boolean;
    }>;
}
```

## Common Use Cases

### Analyzing a Critical Position

```typescript
import { getCloudEval } from '@/lib/lichess/api';

async function analyzePosition(fen, depth = 3) {
    try {
        const evaluation = await getCloudEval(fen, depth);
        
        if (!evaluation) {
            return {
                success: false,
                message: 'Position not found in cloud analysis'
            };
        }
        
        // Format the evaluation into a readable form
        const formattedEval = evaluation.pvs.map(pv => {
            const moveSequence = pv.moves.split(' ').slice(0, 5).join(' ');
            const score = pv.mate 
                ? `Mate in ${Math.abs(pv.mate)}` 
                : `${(pv.cp / 100).toFixed(2)}`;
                
            return {
                score,
                moves: moveSequence,
                evaluation: pv.cp ? pv.cp / 100 : (pv.mate > 0 ? 100 : -100),
                mateIn: pv.mate
            };
        });
        
        return {
            success: true,
            depth: evaluation.depth,
            lines: formattedEval,
            bestMove: formattedEval[0].moves.split(' ')[0]
        };
    } catch (error) {
        console.error('Analysis error:', error);
        return {
            success: false,
            message: 'Error analyzing position'
        };
    }
}

// Example usage
const analysis = await analyzePosition('r1bqkbnr/ppp2ppp/2np4/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 4');

if (analysis.success) {
    console.log(`Best move: ${analysis.bestMove}`);
    console.log(`Evaluation: ${analysis.lines[0].score}`);
    console.log(`Analyzed to depth: ${analysis.depth}`);
    
    console.log('Alternative lines:');
    analysis.lines.slice(1).forEach((line, i) => {
        console.log(`${i+2}. ${line.moves} (${line.score})`);
    });
} else {
    console.log(`Analysis failed: ${analysis.message}`);
}
```

### Checking Endgame Accuracy with Tablebase

```typescript
import { getTablebase } from '@/lib/lichess/api';

async function checkEndgameAccuracy(fen, movePlayed) {
    try {
        const tablebaseData = await getTablebase(fen);
        
        if (!tablebaseData || !tablebaseData.success) {
            return {
                success: false,
                message: 'Position not found in tablebase or too many pieces'
            };
        }
        
        // Find optimal moves
        const optimalMoves = tablebaseData.moves
            .filter(move => move.optimal)
            .map(move => move.san);
        
        // Check if the played move was optimal
        const isOptimal = optimalMoves.includes(movePlayed);
        
        // Find the played move data
        const playedMoveData = tablebaseData.moves.find(move => move.san === movePlayed);
        
        if (!playedMoveData) {
            return {
                success: true,
                isLegal: false,
                message: 'The move played is not legal in this position'
            };
        }
        
        // Generate feedback
        let feedback = '';
        if (isOptimal) {
            feedback = 'Perfect move! This is the best move according to the tablebase.';
        } else {
            const bestMove = tablebaseData.moves.find(move => move.optimal);
            
            if (playedMoveData.wdl === bestMove.wdl) {
                feedback = 'Good move! While not the fastest win, this move preserves the winning advantage.';
            } else if (playedMoveData.wdl > 0 && bestMove.wdl > 0) {
                feedback = `Acceptable move. This still wins, but ${bestMove.san} would win faster.`;
            } else if (playedMoveData.wdl === 0 && bestMove.wdl > 0) {
                feedback = `Missed win. ${bestMove.san} would win, but your move leads to a draw.`;
            } else if (playedMoveData.wdl < 0 && bestMove.wdl >= 0) {
                feedback = `Critical mistake. ${bestMove.san} would draw or win, but your move loses.`;
            }
        }
        
        return {
            success: true,
            isLegal: true,
            isOptimal,
            optimalMoves,
            feedback,
            wdl: playedMoveData.wdl,
            dtz: playedMoveData.dtz
        };
    } catch (error) {
        console.error('Tablebase error:', error);
        return {
            success: false,
            message: 'Error checking tablebase'
        };
    }
}

// Example usage
const accuracy = await checkEndgameAccuracy(
    '8/8/8/8/8/k7/4P3/7K w - - 0 1',
    'e4'
);

if (accuracy.success && accuracy.isLegal) {
    console.log(accuracy.feedback);
    
    if (accuracy.isOptimal) {
        console.log('Optimal move!');
    } else {
        console.log(`Optimal moves were: ${accuracy.optimalMoves.join(', ')}`);
    }
} else {
    console.log(`Check failed: ${accuracy.message}`);
}
```