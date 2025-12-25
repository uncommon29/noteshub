
export interface LinkItem {
  id: string;
  title: string;
  url?: string;
  description?: string;
  content?: string;
}

export interface SubCategory {
  title: string;
  links: LinkItem[];
}

export interface MainCategory {
  title: string;
  subCategories: SubCategory[];
  description?: string;
}

export interface GitHubConfig {
  owner: string;
  repo: string;
  token: string;
  branch: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export type SortOption = 'alpha-asc' | 'alpha-desc' | 'newest';

export type AppView = 'home' | 'detail' | 'creator' | 'editor' | 'settings';
