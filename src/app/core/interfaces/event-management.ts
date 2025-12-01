import { Contact } from './contact';
import { Organization } from './organizations';
import { Users } from '@/core/interfaces/users';
import { FileResponse } from '@/core/interfaces/files';

/**
 * Event Type (Meeting, Training, Inspection, Maintenance)
 */
export interface EventType {
    id: number;
    name: string;
    description?: string;
}

/**
 * Event Status (Draft, Planned, Active, Completed, Cancelled, Postponed)
 */
export interface EventStatus {
    id: number;
    name: string;
    description?: string;
}

/**
 * File attached to event
 */
export interface EventFile {
    id: number;
    file_name: string;
    object_key: string;
    mime_type: string;
    size_bytes: number;
    file_path?: string;
    created_at: string;
}

/**
 * Event (Planned Activity)
 */
export interface Event {
    id: number;
    name: string;
    description?: string | null;
    location?: string | null;
    event_date: string; // ISO 8601 date string

    // Foreign keys and relations
    responsible_contact_id: number;
    responsible_contact?: Contact;

    event_status_id: number;
    event_status?: EventStatus;

    event_type_id: number;
    event_type?: EventType;

    organization_id?: number | null;
    organization?: Organization | null;

    created_by_user_id: number;
    created_by?: Users;

    updated_by_user_id?: number | null;
    updated_by?: Users | null;

    // Files
    files?: FileResponse[];

    // Audit timestamps
    created_at: string;
    updated_at?: string | null;
}

/**
 * Request payload for creating a new event
 * Note: Actual API uses multipart/form-data, so this is for reference
 */
export interface CreateEventPayload {
    name: string;
    description?: string;
    location?: string;
    event_date: string; // RFC3339 (ISO 8601) format
    event_type_id: number;
    organization_id?: number;

    // Contact: either existing or new
    responsible_contact_id?: number;
    responsible_fio?: string;
    responsible_phone?: string;

    // Files will be added separately to FormData
}

/**
 * Request payload for updating an event
 * Note: Actual API uses multipart/form-data, so this is for reference
 */
export interface UpdateEventPayload {
    name?: string;
    description?: string;
    location?: string;
    event_date?: string; // RFC3339 (ISO 8601) format
    event_type_id?: number;
    event_status_id?: number;
    organization_id?: number;

    // Contact: either existing or new
    responsible_contact_id?: number;
    responsible_fio?: string;
    responsible_phone?: string;

    // Files will be added separately to FormData
}

/**
 * Filters for getting events
 */
export interface EventFilters {
    statusId?: number;
    typeId?: number;
    organizationId?: number;
    dateFrom?: string;
    dateTo?: string;
}

/**
 * Response from create event API
 */
export interface CreateEventResponse {
    id: number;
    error: string;
}
