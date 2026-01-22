export type NewsCategoryType = 'instagram' | 'telegram';
export type NewsSource = 'manual' | 'telegram' | 'instagram';
export type NewsStatus = 'draft' | 'published' | 'archived';

export interface NewsCategory {
    id: number;
    name: string;
    type: NewsCategoryType;
    icon: string;
    color: string;
}

export interface NewsMedia {
    id: number;
    type: 'image' | 'video' | 'document';
    url: string;
    fileName?: string;
    thumbnailUrl?: string;
}

export interface News {
    id: number;
    title: string;
    content: string;
    categoryId: number;
    category?: NewsCategory;
    source: NewsSource;
    sourceUrl?: string;
    status: NewsStatus;
    media: NewsMedia[];
    publishedAt?: string;
    createdAt: string;
    updatedAt?: string;
}

export interface NewsPayload {
    title: string;
    content: string;
    categoryId: number;
    source: NewsSource;
    sourceUrl?: string;
    status: NewsStatus;
    publishedAt?: string;
}
