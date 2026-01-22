export interface TelegramMedia {
    type: 'photo' | 'video' | 'document' | null;
    url: string;
    thumbnail_url: string | null;
    file_size: number | null;
    mime_type: string | null;
    duration: number | null;
    width: number | null;
    height: number | null;
    file_name: string | null;
}

export interface TelegramMessage {
    id: number;
    text: string;
    date: string;
    views: number;
    forwards: number;
    reactions: any | null;
    author: string | null;
    media: TelegramMedia | null;
    reply_to_message_id: number | null;
    edit_date: string | null;
    has_protected_content: boolean;
}

export interface TelegramNewsResponse {
    channel_id: number;
    channel_title: string;
    messages: TelegramMessage[];
}

export interface TelegramNewsParams {
    limit?: number;
    offset_id?: number;
    date_from?: string;
    date_to?: string;
}
