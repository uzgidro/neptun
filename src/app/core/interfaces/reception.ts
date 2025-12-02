export interface Reception {
    id: number;
    name: string;
    date: string | Date;
    description?: string;
    visitor: string;
    status: 'default' | 'true' | 'false';
    created_at: string | Date;
    updated_at?: string | Date;
    created_by_id: number;
    updated_by_id?: number;
    created_by?: {
        id: number;
        name: string;
    };
    updated_by?: {
        id: number;
        name: string;
    };
}
