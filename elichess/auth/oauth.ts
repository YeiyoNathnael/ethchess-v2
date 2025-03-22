
import { NextResponse } from 'next/server';

import { cookies } from 'next/headers';
import { createVerifier, createChallenge } from './pkce';
import { getConfig, getBaseUrl } from '../config';

/**
 * Generates the OAuth authorization URL and sets up PKCE
 * 
 * @param request - The incoming request
 * @returns A redirect response to the Lichess OAuth page
 */
export function generateAuthUrl(request: Request) {
  const config = getConfig();
  const baseUrl = getBaseUrl(request);
  const callbackUrl = `${baseUrl}/api/auth/lichess/callback`;
  
  // Generate PKCE code verifier and challenge
  const verifier = createVerifier();
  const challenge = createChallenge(verifier);
  
  // Create the authorization URL
  const authUrl = new URL('https://lichess.org/oauth');
  authUrl.search = new URLSearchParams({
    response_type: 'code',
    client_id: config.clientId,
    redirect_uri: callbackUrl,
    scope: config.scopes.join(' '),
    code_challenge_method: 'S256',
    code_challenge: challenge
  }).toString();
  
  // Create the redirect response
  const response = NextResponse.redirect(authUrl.toString());
  
  // Store the verifier in a cookie
  response.cookies.set({
    name: config.cookies.verifier.name,
    value: verifier,
    httpOnly: true,
    secure: config.cookies.verifier.secure,
    sameSite: 'lax',
    path: '/',
    maxAge: config.cookies.verifier.maxAge
  });
  
  return response;
}

/**
 * Handles the OAuth callback from Lichess
 * 
 * @param request - The incoming request with OAuth code or error
 * @returns A redirect response to the dashboard or error page
 */
export async function handleCallback(request: Request) {
  const config = getConfig();
  const baseUrl = getBaseUrl(request);
  const callbackUrl = `${baseUrl}/api/auth/lichess/callback`;
  
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const error = url.searchParams.get('error');
  
  // Handle error
  if (error) {
    return NextResponse.redirect(`${baseUrl}/auth/error?error=${encodeURIComponent(error)}`);
  }
  
  // Handle missing code
  if (!code) {
    return NextResponse.redirect(`${baseUrl}/auth/error?error=No_authorization_code`);
  }
  
  // Get verifier from cookie
  const cookieStore = cookies();
  const verifier = (await cookieStore).get(config.cookies.verifier.name)?.value;
  
  if (!verifier) {
    return NextResponse.redirect(`${baseUrl}/auth/error?error=No_PKCE_verifier`);
  }
  
  try {
    // Exchange the code for a token
    const tokenResponse = await fetch('https://lichess.org/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        redirect_uri: callbackUrl,
        client_id: config.clientId,
        code,
        code_verifier: verifier
      })
    });
    
    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Token error:', errorText);
      return NextResponse.redirect(`${baseUrl}/auth/error?error=${encodeURIComponent(`Token request failed: ${errorText}`)}`);
    }
    
    const tokens = await tokenResponse.json();
    
    // Get the user info
    const userinfoResponse = await fetch('https://lichess.org/api/account', {
      headers: {
        'Authorization': `Bearer ${tokens.access_token}`
      }
    });
    
    if (!userinfoResponse.ok) {
      const errorText = await userinfoResponse.text();
      console.error('User info error:', errorText);
      return NextResponse.redirect(`${baseUrl}/auth/error?error=${encodeURIComponent(`Userinfo request failed: ${errorText}`)}`);
    }
    
    const userinfo = await userinfoResponse.json();
    
    // Create a session and redirect to dashboard
    const response = NextResponse.redirect(`${baseUrl}/dashboard`);
    
    // Store user session in a cookie
    response.cookies.set({
      name: config.cookies.session.name,
      value: JSON.stringify({
        user: {
          id: userinfo.id,
          name: userinfo.username,
          perfs: userinfo.perfs,
          url: `https://lichess.org/@/${userinfo.username}`,
          createdAt: userinfo.createdAt,
          playTime: userinfo.playTime,
          title: userinfo.title,
          profile: userinfo.profile
        },
        accessToken: tokens.access_token
      }),
      httpOnly: true,
      secure: config.cookies.session.secure,
      sameSite: 'lax',
      path: '/',
      maxAge: config.cookies.session.maxAge
    });
    
    return response;
  } catch (error) {
    console.error('OAuth error:', error);
    return NextResponse.redirect(`${baseUrl}/auth/error?error=${encodeURIComponent(String(error))}`);
  }
}

/**
 * Logs the user out by clearing their session
 * 
 * @param request - The incoming request
 * @returns A redirect response to the home page
 */
export function logout(request: Request) {
  const config = getConfig();
  const baseUrl = getBaseUrl(request);
  
  const response = NextResponse.redirect(`${baseUrl}/`);
  
  // Clear the session cookie
  response.cookies.set({
    name: config.cookies.session.name,
    value: '',
    httpOnly: true,
    secure: config.cookies.session.secure,
    path: '/',
    maxAge: 0
  });
  
  return response;
}