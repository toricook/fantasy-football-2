// app/api/news/season/[season]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { client } from '@/lib/sanity';

interface PageProps {
  params: Promise<{
    season: string;
  }>;
}

export async function GET(request: NextRequest, { params }: PageProps) {
  try {
    const { season } = await params;

    if (!season) {
      return NextResponse.json(
        { error: 'Season parameter is required' },
        { status: 400 }
      );
    }

    const articles = await client.fetch(`
      *[_type == "newsArticle" && season == $season && isPublished == true] | order(publishedAt desc) {
        _id,
        title,
        slug,
        excerpt,
        featuredImage,
        content,
        category,
        tags,
        author,
        publishedAt,
        season
      }
    `, { season });

    return NextResponse.json(articles);
  } catch (error) {
    console.error('Error fetching season articles:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}