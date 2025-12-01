import { FileResponse } from './files';

export type EventType = 'info' | 'warning' | 'danger' | 'success';

export interface Event {
    type: EventType;
    date: string;
    organization_id?: number;
    organization_name?: string;
    description: string;
    entity_type?: string; // "incident", "shutdown", "discharge"
    entity_id?: number;
    files?: FileResponse[];
}

export interface DateGroup {
    date: string;
    events: Event[];
}
