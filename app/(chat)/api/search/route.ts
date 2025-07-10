import { NextRequest, NextResponse } from 'next/server';
import { SearchService } from '@/lib/search-service';

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();
    
    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      );
    }

    const searchService = SearchService.getInstance();
    const results = await searchService.searchWeb(query);

    // Return only the search results without metadata
    return NextResponse.json(results);
    
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    );
  }
} 