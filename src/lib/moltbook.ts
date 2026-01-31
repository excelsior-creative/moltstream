// Moltbook API client
const API_BASE = 'https://www.moltbook.com/api/v1';

export interface MoltbookPost {
  id: string;
  title: string;
  content?: string;
  url?: string;
  submolt: {
    id: string;
    name: string;
    display_name: string;
  };
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  score: number;
  upvotes: number;
  downvotes: number;
  comment_count: number;
  created_at: string;
}

export interface MoltbookComment {
  id: string;
  content: string;
  author: {
    name: string;
  };
  score: number;
  created_at: string;
  replies?: MoltbookComment[];
}

export interface Submolt {
  name: string;
  display_name: string;
  description: string;
  subscriber_count: number;
}

export type SortOption = 'hot' | 'new' | 'top' | 'rising';

// Public API - no auth required for reading
export async function getPosts(options: {
  sort?: SortOption;
  limit?: number;
  submolt?: string;
} = {}): Promise<MoltbookPost[]> {
  const { sort = 'hot', limit = 25, submolt } = options;
  
  let url = `${API_BASE}/posts?sort=${sort}&limit=${limit}`;
  if (submolt) {
    url += `&submolt=${submolt}`;
  }
  
  try {
    const res = await fetch(url, {
      next: { revalidate: 60 }, // Cache for 1 minute
      headers: {
        'Accept': 'application/json',
      }
    });
    
    if (!res.ok) {
      console.error(`Moltbook API error: ${res.status}`);
      return [];
    }
    
    const data = await res.json();
    return data.posts || data || [];
  } catch (error) {
    console.error('Failed to fetch Moltbook posts:', error);
    return [];
  }
}

export async function getPost(id: string): Promise<MoltbookPost | null> {
  try {
    const res = await fetch(`${API_BASE}/posts/${id}`, {
      next: { revalidate: 30 },
      headers: {
        'Accept': 'application/json',
      }
    });
    
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error('Failed to fetch post:', error);
    return null;
  }
}

export async function getComments(postId: string): Promise<MoltbookComment[]> {
  try {
    const res = await fetch(`${API_BASE}/posts/${postId}/comments?sort=top`, {
      next: { revalidate: 60 },
      headers: {
        'Accept': 'application/json',
      }
    });
    
    if (!res.ok) return [];
    const data = await res.json();
    return data.comments || data || [];
  } catch (error) {
    console.error('Failed to fetch comments:', error);
    return [];
  }
}

export async function getSubmolts(): Promise<Submolt[]> {
  try {
    const res = await fetch(`${API_BASE}/submolts`, {
      next: { revalidate: 300 }, // Cache for 5 minutes
      headers: {
        'Accept': 'application/json',
      }
    });
    
    if (!res.ok) return [];
    const data = await res.json();
    return data.submolts || data || [];
  } catch (error) {
    console.error('Failed to fetch submolts:', error);
    return [];
  }
}

export async function searchPosts(query: string, limit = 25): Promise<MoltbookPost[]> {
  try {
    const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}&limit=${limit}`, {
      next: { revalidate: 60 },
      headers: {
        'Accept': 'application/json',
      }
    });
    
    if (!res.ok) return [];
    const data = await res.json();
    return data.posts || data.results || [];
  } catch (error) {
    console.error('Failed to search posts:', error);
    return [];
  }
}

// Format relative time
export function timeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString();
}
