import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { getConfig } from '@/lichess/config';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');
  
  // Get the base URL from the request
  const baseUrl = new URL(request.url).origin;
  const config = getConfig();
  
  // Check for errors
  if (error) {
    console.error(`OAuth error: ${error} - ${errorDescription}`);
    return NextResponse.redirect(new URL(`/?error=${error}&description=${errorDescription}`, baseUrl));
  }
  
  if (!code) {
    return NextResponse.redirect(new URL('/?error=missing_code', baseUrl));
  }
  
  // Get the code verifier from cookies
  const verifier = (await cookies()).get('pkce_verifier');
  
  if (!verifier) {
    return NextResponse.redirect(new URL('/?error=missing_verifier', baseUrl));
  }
  
 
    // Exchange code for token with PKCE verifier
    const tokenResponse = await fetch('https://lichess.org/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        code,
        redirect_uri: `${baseUrl}/api/auth/lichess/callback`,
        client_id: config.clientId,
        code_verifier: verifier.value,
      }),
    });
    
    // Delete the verifier cookie since we don't need it anymore
    (await
          // Delete the verifier cookie since we don't need it anymore
          cookies()).delete('pkce_verifier');
    
    if (!tokenResponse.ok) {
      const error = await tokenResponse.text();
      throw new Error(`Token exchange failed: ${error}`);
    }
    
    const tokenData = await tokenResponse.json();
    
    // Get user info with token
    const userResponse = await fetch('https://lichess.org/api/account', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`
      }
    });
    
    if (!userResponse.ok) {
      throw new Error('Failed to get user info');
    }
    
    const userData = await userResponse.json();
    
    // Create session object
    const session = {
      accessToken: tokenData.access_token,
      user: {
        id: userData.id,
        username: userData.username,
        title: userData.title || null,
      }
    };
    
    // Set session cookie
    (await
          // Set session cookie
          cookies()).set({
      name: config.cookies.session.name,
      value: JSON.stringify(session),
      httpOnly: true,
      path: '/',
      secure: config.cookies.session.secure,
      maxAge: config.cookies.session.maxAge,
    });
    
    return NextResponse.redirect(new URL('/', baseUrl));
  
}