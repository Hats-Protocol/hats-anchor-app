import { NextResponse } from 'next/server';
import { logger } from 'utils';

export const dynamic = 'force-dynamic'; // Ensure this is always a dynamic route

export async function GET() {
  if (!process.env.COINCAP_API_KEY) {
    logger.error('COINCAP_API_KEY is not set');
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
  }

  try {
    const response = await fetch(`https://rest.coincap.io/v3/assets?apiKey=${process.env.COINCAP_API_KEY}&limit=1000`, {
      headers: {
        Accept: 'application/json',
      },
      next: { revalidate: 60 }, // Cache for 1 minute
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error('Failed to fetch token prices:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
      });
      return NextResponse.json({ error: 'Failed to fetch token prices' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    logger.error('Error fetching token prices:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
