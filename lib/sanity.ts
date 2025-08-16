import { createClient } from 'next-sanity'
import imageUrlBuilder from '@sanity/image-url'

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  useCdn: true,
  apiVersion: '2025-08-13',
  token: process.env.SANITY_API_TOKEN
})

const builder = imageUrlBuilder(client)

export function urlFor(source: any) {
  return builder.image(source)
}

// Types
export interface Announcement {
  _id: string
  title: string
  content: any[]
  priority: 'low' | 'normal' | 'high' | 'urgent'
  publishedAt: string
  expiresAt?: string
}

export interface NewsArticle {
  _id: string
  title: string
  slug: { current: string }
  featuredImage?: any
  content: any[]
  author: string
  publishedAt: string
  season: string
}

// GROQ queries
export const queries = {
  announcements: `
    *[_type == "announcement" && isActive == true && publishedAt <= now()] | order(priority desc, publishedAt desc) {
      _id,
      title,
      content,
      priority,
      publishedAt,
      expiresAt
    }
  `,
  
  activeAnnouncements: `
    *[_type == "announcement" && isActive == true && publishedAt <= now() && (expiresAt == null || expiresAt > now())] | order(priority desc, publishedAt desc) {
      _id,
      title,
      content,
      priority,
      publishedAt,
      expiresAt
    }
  `,
  
  newsArticles: `
    *[_type == "newsArticle" && isPublished == true] | order(publishedAt desc) {
      _id,
      title,
      slug,
      featuredImage,
      author,
      publishedAt,
      season,
      content
    }
  `,
  
  currentSeasonNews: `
    *[_type == "newsArticle" && isPublished == true && season == $currentSeason] | order(publishedAt desc) [0...5] {
      _id,
      title,
      slug,
      featuredImage,
      publishedAt,
      season
    }
  `,
  
  seasonNews: `
    *[_type == "newsArticle" && isPublished == true && season == $season] | order(publishedAt desc) {
      _id,
      title,
      slug,
      featuredImage,
      author,
      publishedAt,
      season,
      content
    }
  `,
  
  newsArticleBySlug: `
    *[_type == "newsArticle" && slug.current == $slug && isPublished == true][0] {
      _id,
      title,
      slug,
      featuredImage,
      content,
      author,
      publishedAt,
      season
    }
  `
}

// Helper functions
export async function getAnnouncements() {
  return await client.fetch(queries.activeAnnouncements)
}

export async function getRecentNews(limit = 5) {
  const currentSeason = new Date().getFullYear().toString();
  return await client.fetch(queries.currentSeasonNews, { currentSeason })
}

export async function getAllNews() {
  return await client.fetch(queries.newsArticles)
}

export async function getSeasonNews(season: string) {
  return await client.fetch(queries.seasonNews, { season })
}

export async function getNewsArticle(slug: string) {
  return await client.fetch(queries.newsArticleBySlug, { slug })
}