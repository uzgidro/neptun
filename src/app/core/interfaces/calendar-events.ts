export interface DayCounts {
    date: string;
    incidents: number;
    shutdowns: number;
    discharges: number;
    visits: number;
}

export interface CalendarResponse {
    year: number;
    month: number;
    days: DayCounts[];
}
