import { NextResponse } from 'next/server';
import { getConfig } from '@/elichess/config';
import { cookies } from 'next/headers';
import { randomBytes, createHash } from 'crypto';

// Server-side code verifier generation
function generateCodeVerifier(): string {
  return randomBytes(32).toString('hex');
}

// Server-side code challenge generation
async function generateCodeChallenge(verifier: string): Promise<string> {
  // import crypto from 'crypto';
  const base64URLEncode = (buf: Buffer): string => 
    buf.toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
      
  const sha256 = (str: string): Buffer => 
    createHash('sha256').update(str).digest();
    
  return base64URLEncode(sha256(verifier));
}

export async function GET(request: Request) {
  const config = getConfig();
  // Get base URL from request or environment
  const baseUrl = new URL(request.url).origin;
  const redirectUri = `${baseUrl}/api/auth/lichess/callback`;
  
  // Generate PKCE values
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);
  
  // Store code verifier in cookies to use later
  (await
        // Store code verifier in cookies to use later
        cookies()).set({
    name: 'pkce_verifier',
    value: codeVerifier,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 10, // 10 minutes
    path: '/',
  });
  
  // Create the authorization URL with PKCE
  const authUrl = new URL('https://lichess.org/oauth');
  authUrl.searchParams.append('response_type', 'code');
  authUrl.searchParams.append('client_id', config.clientId);
  authUrl.searchParams.append('redirect_uri', redirectUri);
  authUrl.searchParams.append('scope', config.scopes.join(' '));
  authUrl.searchParams.append('code_challenge', codeChallenge);
  authUrl.searchParams.append('code_challenge_method', 'S256');
  
  return NextResponse.redirect(authUrl);
}