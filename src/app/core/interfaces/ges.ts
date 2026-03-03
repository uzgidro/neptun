import { Organization } from '@/core/interfaces/organizations';
import { Department } from '@/core/interfaces/department';
import { Position } from '@/core/interfaces/position';
import { UserShortInfo } from '@/core/interfaces/users';
import { FileResponse } from '@/core/interfaces/files';
import { ContactIcon } from '@/core/interfaces/contact';

// Основная информация о ГЭС
export interface GesResponse {
    id: number;
    name: string;
    parent_organization_id?: number;
    parent_organization?: string;
    types: string[];
    items?: GesResponse[];
}

// Контакты ГЭС
export interface GesContact {
    id: number;
    name: string;
    email?: string | null;
    phone?: string | null;
    ip_phone?: string | null;
    dob?: string | null;
    organization?: Organization | null;
    department?: Department | null;
    position?: Position | null;
    icon?: ContactIcon;
}

// Остановы ГЭС
export interface GesShutdown {
    id: number;
    organization_id: number;
    organization_name: string;
    started_at: string;
    ended_at?: string | null;
    reason?: string | null;
    created_by: UserShortInfo;
    generation_loss?: number | null;
    idle_discharge_volume?: number | null;
    files?: FileResponse[];
}

// Сбросы ГЭС
export interface GesDischarge {
    id: number;
    organization: Organization | null;
    created_by: UserShortInfo;
    approved_by?: UserShortInfo | null;
    started_at: string;
    ended_at?: string | null;
    flow_rate: number;
    total_volume: number;
    reason?: string | null;
    is_ongoing: boolean;
    approved?: boolean | null;
    files?: FileResponse[];
}

// Инциденты ГЭС
export interface GesIncident {
    id: number;
    incident_date: string;
    description: string;
    organization_id?: number;
    organization?: string;
    created_by?: UserShortInfo;
    files?: FileResponse[];
}

// Посещения ГЭС
export interface GesVisit {
    id: number;
    organization_id: number;
    organization_name: string;
    visit_date: string;
    description: string;
    responsible_name: string;
    created_by?: UserShortInfo;
    files?: FileResponse[];
}

// Телеметрия - точка данных
export interface DataPoint {
    name: string;
    value: any;
    unit?: string;
    quality: 'good' | 'bad' | 'uncertain';
    severity?: 'normal' | 'warning' | 'alarm' | 'critical';
}

// Телеметрия - конверт данных
export interface TelemetryEnvelope {
    id: string;
    station_id: string;
    station_name: string;
    timestamp: string;
    device_id: string;
    device_name: string;
    device_group: string;
    values: DataPoint[];
}

// Параметры фильтрации по датам
export interface DateRangeParams {
    start_date?: string; // YYYY-MM-DD
    end_date?: string; // YYYY-MM-DD
}

// KPI данные для дашборда
export interface GesKpiData {
    shutdownsCount: number;
    dischargesCount: number;
    currentPower: number;
    activeAggregates: number;
    totalAggregates: number;
}

// Параметр гидроагрегата (строка таблицы)
export interface GeneratorParam {
    label: string; // i18n ключ названия параметра
    value: string; // отформатированное значение
    unit: string; // i18n ключ единицы измерения
}

// Данные гидроагрегата для отображения
export interface GeneratorView {
    id: string;
    name: string;
    status: 'active' | 'pending' | 'repair' | 'offline';
    params: GeneratorParam[];
}

// Данные АСКУЭ
export interface ASCUEMetrics {
    active?: number; // Активная мощность (МВт)
    reactive?: number; // Реактивная мощность (МВАр)
    power_import?: number; // Импорт мощности
    power_export?: number; // Экспорт мощности
    own_needs?: number; // Собственные нужды
    flow?: number; // Расход воды (м³/с)
    active_agg_count?: number; // Количество работающих агрегатов
    pending_agg_count?: number; // Количество агрегатов в резерве
    repair_agg_count?: number; // Количество агрегатов в ремонте
}
