export interface DashboardResponse {
    date: string;
    value: number;
    change_percent: number;
    change_direction: 'up' | 'down' | 'neutral';
}
