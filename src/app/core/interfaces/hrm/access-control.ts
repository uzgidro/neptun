// Access Control - Контроль доступа и пропускная система

export interface AccessCard {
    id: number;
    card_number: string;
    employee_id: number;
    employee_name: string;
    employee_code: string;
    department_name: string;
    position_name: string;
    photo_url?: string;
    status: CardStatus;
    issued_at: string;
    valid_from: string;
    valid_until: string;
    access_zones: number[]; // IDs зон доступа
    access_schedule_id?: number;
    last_used_at?: string;
    last_zone?: string;
    notes?: string;
}

export interface AccessZone {
    id: number;
    name: string;
    code: string;
    description?: string;
    location: string;
    security_level: SecurityLevel;
    requires_escort: boolean;
    max_occupancy?: number;
    current_occupancy?: number;
    parent_zone_id?: number;
    readers: AccessReader[];
    is_active: boolean;
}

export interface AccessReader {
    id: number;
    name: string;
    zone_id: number;
    type: ReaderType;
    direction: 'entry' | 'exit' | 'both';
    ip_address?: string;
    is_online: boolean;
    last_heartbeat?: string;
}

export interface AccessSchedule {
    id: number;
    name: string;
    description?: string;
    is_default: boolean;
    rules: ScheduleRule[];
}

export interface ScheduleRule {
    day_of_week: number; // 0-6
    start_time: string; // HH:mm
    end_time: string; // HH:mm
    is_allowed: boolean;
}

export interface AccessLog {
    id: number;
    timestamp: string;
    card_id: number;
    card_number: string;
    employee_id: number;
    employee_name: string;
    zone_id: number;
    zone_name: string;
    reader_id: number;
    reader_name: string;
    direction: 'entry' | 'exit';
    status: AccessEventStatus;
    denial_reason?: string;
    photo_captured?: string;
}

export interface AccessPermission {
    id: number;
    employee_id: number;
    employee_name: string;
    zone_id: number;
    zone_name: string;
    granted_by: number;
    granted_by_name: string;
    granted_at: string;
    valid_from: string;
    valid_until?: string;
    is_temporary: boolean;
    reason?: string;
}

export interface AccessRequest {
    id: number;
    employee_id: number;
    employee_name: string;
    department_name: string;
    requested_zones: number[];
    requested_zone_names: string[];
    reason: string;
    valid_from: string;
    valid_until?: string;
    is_temporary: boolean;
    status: RequestStatus;
    requested_at: string;
    processed_by?: number;
    processed_by_name?: string;
    processed_at?: string;
    rejection_reason?: string;
}

export interface AccessStats {
    total_cards: number;
    active_cards: number;
    blocked_cards: number;
    expired_cards: number;
    total_zones: number;
    entries_today: number;
    exits_today: number;
    current_on_site: number;
    denied_today: number;
    pending_requests: number;
}

export interface ZoneOccupancy {
    zone_id: number;
    zone_name: string;
    current: number;
    max: number;
    percentage: number;
}

// Types
export type CardStatus =
    | 'active'      // Активна
    | 'blocked'     // Заблокирована
    | 'expired'     // Истёк срок
    | 'lost'        // Утеряна
    | 'returned';   // Сдана

export type SecurityLevel =
    | 'public'      // Общедоступная
    | 'standard'    // Стандартная
    | 'restricted'  // Ограниченный доступ
    | 'high'        // Высокий уровень
    | 'critical';   // Критический

export type ReaderType =
    | 'card'        // Карточный
    | 'biometric'   // Биометрический
    | 'pin'         // PIN-код
    | 'combined';   // Комбинированный

export type AccessEventStatus =
    | 'granted'     // Доступ разрешён
    | 'denied'      // Доступ запрещён
    | 'error';      // Ошибка

export type RequestStatus =
    | 'pending'     // На рассмотрении
    | 'approved'    // Одобрено
    | 'rejected';   // Отклонено

// Constants
export const CARD_STATUSES: { value: CardStatus; label: string; severity: string; icon: string }[] = [
    { value: 'active', label: 'Активна', severity: 'success', icon: 'pi-check-circle' },
    { value: 'blocked', label: 'Заблокирована', severity: 'danger', icon: 'pi-ban' },
    { value: 'expired', label: 'Истёк срок', severity: 'warn', icon: 'pi-clock' },
    { value: 'lost', label: 'Утеряна', severity: 'danger', icon: 'pi-exclamation-triangle' },
    { value: 'returned', label: 'Сдана', severity: 'secondary', icon: 'pi-undo' }
];

export const SECURITY_LEVELS: { value: SecurityLevel; label: string; color: string }[] = [
    { value: 'public', label: 'Общедоступная', color: 'green' },
    { value: 'standard', label: 'Стандартная', color: 'blue' },
    { value: 'restricted', label: 'Ограниченный', color: 'orange' },
    { value: 'high', label: 'Высокий', color: 'red' },
    { value: 'critical', label: 'Критический', color: 'purple' }
];

export const ACCESS_EVENT_STATUSES: { value: AccessEventStatus; label: string; severity: string }[] = [
    { value: 'granted', label: 'Разрешён', severity: 'success' },
    { value: 'denied', label: 'Запрещён', severity: 'danger' },
    { value: 'error', label: 'Ошибка', severity: 'warn' }
];

export const REQUEST_STATUSES: { value: RequestStatus; label: string; severity: string }[] = [
    { value: 'pending', label: 'На рассмотрении', severity: 'warn' },
    { value: 'approved', label: 'Одобрено', severity: 'success' },
    { value: 'rejected', label: 'Отклонено', severity: 'danger' }
];

export const DAYS_OF_WEEK: { value: number; label: string; short: string }[] = [
    { value: 0, label: 'Воскресенье', short: 'Вс' },
    { value: 1, label: 'Понедельник', short: 'Пн' },
    { value: 2, label: 'Вторник', short: 'Вт' },
    { value: 3, label: 'Среда', short: 'Ср' },
    { value: 4, label: 'Четверг', short: 'Чт' },
    { value: 5, label: 'Пятница', short: 'Пт' },
    { value: 6, label: 'Суббота', short: 'Сб' }
];
