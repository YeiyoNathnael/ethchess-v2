import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { getConfig } from '@/elichess/config';

export async function POST() {
  const config = getConfig();
  
  // Delete the session cookie
  (await
        // Delete the session cookie
        cookies()).delete(config.cookies.session.name);
  
  // Clear other potential auth cookies
  (await
        // Clear other potential auth cookies
        cookies()).delete('lichess_session');
  (await cookies()).delete('lichess_token');
  
  return NextResponse.json({ success: true });
}

export async function GET(request: Request) {
  const config = getConfig();
  const baseUrl = new URL(request.url).origin;
  
  // Delete the session cookie
  (await
        // Delete the session cookie
        cookies()).delete(config.cookies.session.name);
  
  // Clear other potential auth cookies
  (await
        // Clear other potential auth cookies
        cookies()).delete('lichess_session');
  (await cookies()).delete('lichess_token');
  
  return NextResponse.redirect(new URL('/', baseUrl));
}