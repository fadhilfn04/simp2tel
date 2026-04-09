import { NextResponse } from 'next/server';

// Simple in-memory cache
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export async function GET(
  request: Request,
  { params }: { params: { provinceId: string } }
) {
  try {
    const { provinceId } = params;
    const now = Date.now();
    const cacheKey = `regency-${provinceId}`;

    // Check cache
    const cached = cache.get(cacheKey);
    if (cached && now - cached.timestamp < CACHE_DURATION) {
      console.log(`Returning cached regencies for province ${provinceId}`);
      return NextResponse.json(cached.data);
    }

    console.log(`Fetching regencies for province ${provinceId}`);

    const sources = [
      `https://emsifa.github.io/api-wilayah-indonesia/api/regencies/${provinceId}.json`,
      `https://api-wilayah-indonesia.vercel.app/regencies/${provinceId}.json`,
    ];

    let data = null;
    let lastError = null;

    for (const source of sources) {
      try {
        const response = await fetch(source, {
          headers: { 'Accept': 'application/json' },
        });

        if (response.ok) {
          data = await response.json();
          if (Array.isArray(data) && data.length > 0) {
            console.log(`Fetched ${data.length} regencies from ${source}`);
            break;
          }
        }
      } catch (error) {
        console.error(`Failed to fetch from ${source}:`, error);
        lastError = error;
        continue;
      }
    }

    if (!data || !Array.isArray(data)) {
      throw new Error(`All sources failed. Last error: ${lastError}`);
    }

    // Cache the result
    cache.set(cacheKey, { data, timestamp: now });

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching regencies:', error);

    // Try to return stale cache if available
    const cached = cache.get(`regency-${params.provinceId}`);
    if (cached) {
      console.log('Returning stale cache as fallback');
      return NextResponse.json(cached.data);
    }

    return NextResponse.json(
      { error: 'Failed to fetch regencies', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
