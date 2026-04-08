import { Contact } from '@/core/interfaces/contact';

export interface Users {
    id: number;
    name: string;
    login: string;
    is_active: boolean;
    roles: string[];
    role_ids: number[];
    contact?: Contact;
}

export interface UserShortInfo {
    id: number;
    name: string | null;
}

export interface NewContactRequest {
    name: string;
    email?: string | null;
    phone?: string | null;
    ip_phone?: string | null;
    dob?: string | null; // (time.Time -> string в JSON)
    external_organization_name?: string | null;
    organization_id?: number | null;
    department_id?: number | null;
    position_id?: number | null;
}

export interface AddUserRequest {
    login: string;
    password: string;
    role_ids: number[];

    // XOR: Либо `contact_id`, либо `contact`
    contact_id?: number | null;
    contact?: NewContactRequest | null;
}

export interface EditUserRequest {
    login?: string | null;
    password?: string | null;
    role_ids?: number[] | null;
}

export interface UserCreatePayload {
    login: string;
    password: string;
    role_ids: number[];
    contact_id?: number | null;
    contact?: NewContactRequest & { icon_id?: number } | null;
}

export interface UserUpdatePayload {
    login?: string | null;
    password?: string | null;
    role_ids?: number[] | null;
    is_active?: boolean;
    icon_id?: number;
}
