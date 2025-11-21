export type EventType = 'info' | 'warning' | 'danger' | 'success';

export interface Event {
    type: EventType;
    date: string;
    organization_id?: number;
    organization_name?: string;
    description: string;
}

export interface DateGroup {
    date: string;
    events: Event[];
}

export interface PastEventsResponse {
    events_by_date: DateGroup[];
}
