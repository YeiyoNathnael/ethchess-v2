/**
 * Core types for Lichess API integration
 */

/**
 * Configuration for the Lichess API client
 */
export interface LichessConfig {
    /** Lichess OAuth client ID */
    clientId: string;
    
    /** Base URL for your application (for redirects) */
    baseUrl: string;
    
    /** OAuth scopes to request */
    scopes: string[];
    
    /** Cookie configuration */
    cookies: {
      /** Session cookie settings */
      session: {
        /** Name of the session cookie */
        name: string;
        /** Max age in seconds */
        maxAge: number;
        /** Whether to use secure cookies */
        secure: boolean;
      };
      /** PKCE verifier cookie settings */
      verifier: {
        /** Name of the verifier cookie */
        name: string;
        /** Max age in seconds */
        maxAge: number;
        /** Whether to use secure cookies */
        secure: boolean;
      };
    };
  }
  
  /**
   * User performance rating in a specific game variant
   */
  export interface LichessPerf {
    /** Number of games played */
    games: number;
    /** Current rating */
    rating: number;
    /** Rating deviation */
    rd: number;
    /** Progress over the last ~10 games */
    prog: number;
    /** Whether the rating is provisional */
    prov?: boolean;
  }
  
  /**
   * All performance ratings for a user
   */
  export interface LichessPerfs {
    chess960?: LichessPerf;
    atomic?: LichessPerf;
    racingKings?: LichessPerf;
    ultraBullet?: LichessPerf;
    blitz?: LichessPerf;
    kingOfTheHill?: LichessPerf;
    bullet?: LichessPerf;
    correspondence?: LichessPerf;
    horde?: LichessPerf;
    puzzle?: LichessPerf;
    classical?: LichessPerf;
    rapid?: LichessPerf;
  }
  
  /**
   * Puzzle mode performance
   */
  export interface LichessPuzzleModePerf {
    /** Number of runs */
    runs: number;
    /** High score */
    score: number;
  }
  
  /**
   * User play time statistics
   */
  export interface LichessPlayTime {
    /** Total time in seconds spent playing */
    total: number;
    /** Total time in seconds spent on TV */
    tv: number;
  }
  
  /**
   * User profile information
   */
  export interface LichessProfile {
    /** Country code */
    flag?: string;
    /** Location text */
    location?: string;
    /** Bio text */
    bio?: string;
    /** Real name */
    realName?: string;
    /** FIDE rating if set by user */
    fideRating?: number;
    /** Links associated with the profile */
    links?: string;
  }
  
  /**
   * Chess title (GM, IM, etc.)
   */
  export type LichessTitle = 'GM' | 'WGM' | 'IM' | 'WIM' | 'FM' | 'WFM' | 'NM' | 'CM' | 'WCM' | 'WNM' | 'LM' | 'BOT';
  
  /**
   * User flair icon
   */
  export type LichessFlair = string;
  
  /**
   * Lichess user data
   */
  export interface LichessUser {
    /** User ID (lowercase username) */
    id: string;
    
    /** Display username (proper case) */
    username: string;
    
    /** Performance ratings across variants */
    perfs?: LichessPerfs;
    
    /** User's flair icon if any */
    flair?: LichessFlair;
    
    /** Timestamp of account creation */
    createdAt: number;
    
    /** Whether account is disabled */
    disabled?: boolean;
    
    /** Whether user violated terms of service */
    tosViolation?: boolean;
    
    /** Profile information */
    profile?: LichessProfile;
    
    /** Timestamp of last activity */
    seenAt: number;
    
    /** Whether user is a patron */
    patron?: boolean;
    
    /** Whether account is verified */
    verified?: boolean;
    
    /** Play time statistics */
    playTime?: LichessPlayTime;
    
    /** Title if any (GM, IM, etc) */
    title?: LichessTitle;
  }
  
  /**
   * Lichess session data
   */
  export interface LichessSession {
    /** User data */
    user: {
      /** User ID */
      id: string;
      /** Display username */
      name: string;
      /** Performance ratings */
      perfs?: LichessPerfs;
      /** Profile URL */
      url?: string;
      /** Timestamp of account creation */
      createdAt?: number;
      /** Play time statistics */
      playTime?: LichessPlayTime;
      /** Any additional properties */
      [key: string]: any;
    };
    /** OAuth access token */
    accessToken: string;
  }
  
  /**
   * Game variant
   */
  export type LichessVariantKey = 
    | 'standard'
    | 'chess960'
    | 'crazyhouse'
    | 'antichess'
    | 'atomic'
    | 'horde'
    | 'kingOfTheHill'
    | 'racingKings'
    | 'threeCheck'
    | 'fromPosition';
  
  /**
   * Game time control speed
   */
  export type LichessSpeed = 
    | 'ultraBullet'
    | 'bullet'
    | 'blitz'
    | 'rapid'
    | 'classical'
    | 'correspondence';
  
  /**
   * Player in a game
   */
  export interface LichessGamePlayer {
    /** User information */
    user: {
      /** Username */
      name: string;
      /** User ID */
      id: string;
    };
    /** Rating */
    rating: number;
    /** Analysis if available */
    analysis?: {
      /** Number of inaccuracies */
      inaccuracy: number;
      /** Number of mistakes */
      mistake: number;
      /** Number of blunders */
      blunder: number;
      /** Average centipawn loss */
      acpl: number;
    };
  }
  
  /**
   * Game clock settings
   */
  export interface LichessGameClock {
    /** Initial time in seconds */
    initial: number;
    /** Increment in seconds */
    increment: number;
    /** Total time in seconds */
    totalTime: number;
  }
  
  /**
   * Basic game information
   */
  export interface LichessGame {
    /** Game ID */
    id: string;
    /** Whether the game is rated */
    rated: boolean;
    /** Game variant */
    variant: string;
    /** Game speed */
    speed: LichessSpeed;
    /** Performance type */
    perf: string;
    /** Timestamp of game creation */
    createdAt: number;
    /** Timestamp of last move */
    lastMoveAt: number;
    /** Game status */
    status: string;
    /** Players */
    players: {
      white: LichessGamePlayer;
      black: LichessGamePlayer;
    };
    /** Winner ("white" or "black") */
    winner?: 'white' | 'black';
    /** PGN moves */
    moves?: string;
    /** Clock settings */
    clock?: LichessGameClock;
  }
  
  /**
   * Tournament information
   */
  export interface LichessTournament {
    /** Tournament ID */
    id: string;
    /** Creator username */
    createdBy: string;
    /** Tournament system (arena, swiss) */
    system: string;
    /** Duration in minutes */
    minutes: number;
    /** Clock settings */
    clock: {
      /** Time limit in seconds */
      limit: number;
      /** Increment in seconds */
      increment: number;
    };
    /** Game variant */
    variant: {
      /** Variant key */
      key: string;
      /** Variant name */
      name: string;
    };
    /** Whether tournament is rated */
    rated: boolean;
    /** Tournament status code (10: created, 20: started, 30: finished) */
    status: number;
    /** Start timestamp */
    startsAt: number;
    /** Number of players */
    nbPlayers: number;
    /** Performance category */
    perf: {
      /** Performance key */
      key: string;
      /** Performance name */
      name: string;
    };
    /** Seconds until start if not yet started */
    secondsToStart?: number;
    /** Tournament full name */
    fullName: string;
    /** Starting position if any */
    position?: string;
  }