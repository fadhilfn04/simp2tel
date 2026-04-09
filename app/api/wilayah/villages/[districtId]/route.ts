import { NextResponse } from 'next/server';

const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ districtId: string }> }
) {
  try {
    const { districtId } = await params;
    const now = Date.now();
    const cacheKey = `village-${districtId}`;

    const cached = cache.get(cacheKey);
    if (cached && now - cached.timestamp < CACHE_DURATION) {
      return NextResponse.json(cached.data);
    }

    const sources = [
      `https://emsifa.github.io/api-wilayah-indonesia/api/villages/${districtId}.json`,
      `https://api-wilayah-indonesia.vercel.app/villages/${districtId}.json`,
    ];

    let data = null;

    for (const source of sources) {
      try {
        const response = await fetch(source, {
          headers: { 'Accept': 'application/json' },
        });

        if (response.ok) {
          data = await response.json();
          if (Array.isArray(data) && data.length > 0) {
            break;
          }
        }
      } catch (error) {
        console.error(`Failed ${source}:`, error);
        continue;
      }
    }

    if (!data || !Array.isArray(data)) {
      throw new Error('All sources failed');
    }

    cache.set(cacheKey, { data, timestamp: now });
    return NextResponse.json(data);
  } catch (error) {
    const { districtId } = await params;
    const cached = cache.get(`village-${districtId}`);
    if (cached) return NextResponse.json(cached.data);

    return NextResponse.json(
      { error: 'Failed to fetch villages' },
      { status: 500 }
    );
  }
}
