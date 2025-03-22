import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { getConfig } from '@/lichess/config';

export async function GET() {
  const config = getConfig();
  const cookieStore = cookies();
  const sessionCookie = (await cookieStore).get(config.cookies.session.name);
  
  if (!sessionCookie) {
    return NextResponse.json({ error: 'No session found' }, { status: 401 });
  }
  
 
    const session = JSON.parse(sessionCookie.value);
    return NextResponse.json(session);
 
}