// This is a client-safe version that doesn't import server-only modules
import { LichessSession } from '../types';

// Re-export the client-side functions
export { 
  is_Authenticated, 
  getSession,
  loginWithLichess,
  logout
} from './client';

// Define any additional types or helpers needed
export type { LichessSession };