import { NextResponse } from 'next/server';
import { getClientIp, hashIp } from '@/lib/utils';

export async function GET(req: Request) {
  const ip = getClientIp(req);
  const ipHash = hashIp(ip);
  
  return NextResponse.json({ ipHash });
}
