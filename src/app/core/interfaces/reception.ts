import { Users } from '@/core/interfaces/users';

export interface Reception {
    id: number;
    name: string;
    date: string | Date;
    description?: string;
    visitor: string;
    status: 'default' | 'true' | 'false';
    status_change_reason?: string;
    informed?: boolean;
    informed_by_id?: number;
    informed_by?: Users;
    created_at: string | Date;
    updated_at?: string | Date;
    created_by_id: number;
    updated_by_id?: number;
    created_by?: Users;
    updated_by?: Users;
}
