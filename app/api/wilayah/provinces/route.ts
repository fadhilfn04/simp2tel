import { NextResponse } from 'next/server';
import provinces from '@/lib/data/provinces.json';

export async function GET() {
  // Return static data - always available and fast
  return NextResponse.json(provinces);
}
