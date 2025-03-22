import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { getConfig } from '@/elichess/config';

export async function GET() {
  const config = getConfig();
  const cookieStore = cookies();
  const sessionCookie = (await cookieStore).get(config.cookies.session.name);
  
  return NextResponse.json({ 
    isAuthenticated: !!sessionCookie 
  });
}