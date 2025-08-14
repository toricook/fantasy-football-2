// lib/sanity.ts
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
  excerpt?: string
  featuredImage?: any
  content: any[]
  category: string
  tags?: string[]
  author: string
  publishedAt: string
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
      excerpt,
      featuredImage,
      category,
      tags,
      author,
      publishedAt,
      content
    }
  `,
  
  recentNews: `
    *[_type == "newsArticle" && isPublished == true] | order(publishedAt desc) [0...5] {
      _id,
      title,
      slug,
      excerpt,
      featuredImage,
      category,
      publishedAt
    }
  `,
  
  newsArticleBySlug: `
    *[_type == "newsArticle" && slug.current == $slug && isPublished == true][0] {
      _id,
      title,
      slug,
      excerpt,
      featuredImage,
      content,
      category,
      tags,
      author,
      publishedAt
    }
  `
}

// Helper functions
export async function getAnnouncements() {
  return await client.fetch(queries.activeAnnouncements)
}

export async function getRecentNews(limit = 5) {
  const query = `
    *[_type == "newsArticle" && isPublished == true] | order(publishedAt desc) [0...${limit}] {
      _id,
      title,
      slug,
      excerpt,
      featuredImage,
      category,
      publishedAt
    }
  `
  return await client.fetch(query)
}

export async function getAllNews() {
  return await client.fetch(queries.newsArticles)
}

export async function getNewsArticle(slug: string) {
  return await client.fetch(queries.newsArticleBySlug, { slug })
}