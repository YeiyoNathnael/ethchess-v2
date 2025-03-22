import { LichessConfig } from './types';

// Helper to safely access process.env
const getEnv = (key: string): string | undefined => {
  // Check if process is defined before accessing env
  // 
  if (typeof process !== 'undefined' && process.env) {
    // 
    return process.env[key];
  }
  return undefined;
};

// Check if we're in production
const isProduction = getEnv('NODE_ENV') === 'production';

/**
 * Default configuration for the Lichess API client
 */
const defaultConfig: LichessConfig = {
  // Client ID for OAuth. Default is "ethchess_app", but should be overridden with your own
  clientId: getEnv('LICHESS_CLIENT_ID') || 'ethchess_app',
  
  // Base URL for your application, used for redirects
  // Uses environment variable, or defaults based on environment
  baseUrl: getEnv('NEXT_PUBLIC_BASE_URL') || 
         (isProduction 
            ? 'https://your-production-domain.com' 
            : 'http://localhost:3000'),
  
  // OAuth scopes to request - customize this based on your needs
  scopes: ['preference:read', 'challenge:write', 'board:play'],
  
  // Cookie settings
  cookies: {
    // Session cookie for storing user session
    session: {
      name: 'user_session',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      secure: isProduction,
    },
    // Verifier cookie for OAuth PKCE
    verifier: {
      name: 'lichess_verifier',
      maxAge: 600, // 10 minutes
      secure: isProduction,
    }
  }
};

/**
 * Get configuration with optional overrides
 * 
 * @param overrides - Optional configuration overrides
 * @returns The final configuration
 */
export function getConfig(overrides?: Partial<LichessConfig>): LichessConfig {
  // Deep merge the default config with any overrides
  return {
    ...defaultConfig,
    ...overrides,
    // Merge the cookies object separately to avoid completely replacing it
    cookies: {
      ...defaultConfig.cookies,
      ...(overrides?.cookies || {}),
      // Merge session and verifier separately if provided
      session: {
        ...defaultConfig.cookies.session,
        ...(overrides?.cookies?.session || {})
      },
      verifier: {
        ...defaultConfig.cookies.verifier,
        ...(overrides?.cookies?.verifier || {})
      }
    },
    // Merge scopes if provided, otherwise use defaults
    scopes: overrides?.scopes || defaultConfig.scopes
  };
}

/**
 * Determines the base URL for the application
 * 
 * This is important for constructing correct redirect URLs
 * 
 * @param req - Optional request object to determine the host
 * @returns The application base URL
 */
export function getBaseUrl(req?: Request): string {
  // If explicitly set in environment, use that
  if (getEnv('NEXT_PUBLIC_BASE_URL')) {
    return getEnv('NEXT_PUBLIC_BASE_URL')!;
  }
  
  // If request object is provided, extract from request
  if (req) {
    const url = new URL(req.url);
    // Check for forwarded protocol header (common with proxies/load balancers)
    const protocol = req.headers.get('x-forwarded-proto') || 
                    (url.host.includes('localhost') ? 'http' : 'https');
    return `${protocol}://${url.host}`;
  }
  
  // Fallback to default
  return defaultConfig.baseUrl;
}