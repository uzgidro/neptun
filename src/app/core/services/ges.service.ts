import { Injectable } from '@angular/core';
import { ApiService } from '@/core/services/api.service';
import { Observable, of, delay } from 'rxjs';
import { GesResponse, GesContact, GesShutdown, GesDischarge, GesIncident, GesVisit, TelemetryEnvelope, DateRangeParams, ASCUEMetrics } from '@/core/interfaces/ges';
import { Department } from '@/core/interfaces/department';

const MOCK_GES_INFO: Record<number, GesResponse> = {
    5: {
        id: 5,
        name: 'Молокозавод №1',
        parent_organization_id: 1,
        parent_organization: 'Производственный кластер "Центр"',
        types: ['Молокозавод'],
        items: []
    },
    6: {
        id: 6,
        name: 'Молокозавод №2',
        parent_organization_id: 1,
        parent_organization: 'Производственный кластер "Центр"',
        types: ['Молокозавод'],
        items: []
    },
    7: {
        id: 7,
        name: 'Молокозавод №3',
        parent_organization_id: 2,
        parent_organization: 'Производственный кластер "Восток"',
        types: ['Молокозавод'],
        items: []
    },
    10: {
        id: 10,
        name: 'Мини-цех "Восток"',
        parent_organization_id: 2,
        parent_organization: 'Производственный кластер "Восток"',
        types: ['Мини-цех'],
        items: []
    }
};

function now(): string {
    return new Date().toISOString();
}

function hoursAgo(h: number): string {
    return new Date(Date.now() - h * 3600000).toISOString();
}

@Injectable({
    providedIn: 'root'
})
export class GesService extends ApiService {
    getGesInfo(id: number): Observable<GesResponse> {
        const info = MOCK_GES_INFO[id] ?? {
            id,
            name: `Молокозавод №${id}`,
            parent_organization_id: 1,
            parent_organization: 'Производственный кластер "Центр"',
            types: ['Молокозавод'],
            items: []
        };
        return of(info).pipe(delay(150));
    }

    getDepartments(id: number): Observable<Department[]> {
        return of([
            { id: 1, name: 'Производственный отдел', description: 'Основное производство', organization_id: id },
            { id: 2, name: 'Отдел качества', description: 'Контроль качества продукции', organization_id: id },
            { id: 3, name: 'Техническая служба', description: 'Обслуживание оборудования', organization_id: id }
        ] as Department[]).pipe(delay(100));
    }

    getContacts(id: number): Observable<GesContact[]> {
        return of([
            { id: 1, name: 'Иванов И.И.', email: 'ivanov@example.com', phone: '+998901234567', ip_phone: '1001', dob: null, organization: null, department: { id: 1, name: 'Производственный отдел', description: '', organization_id: id }, position: { id: 1, description: 'Директор' }, icon: undefined },
            { id: 2, name: 'Петров П.П.', email: 'petrov@example.com', phone: '+998901234568', ip_phone: '1002', dob: null, organization: null, department: { id: 2, name: 'Отдел качества', description: '', organization_id: id }, position: { id: 2, description: 'Технолог' }, icon: undefined },
            { id: 3, name: 'Сидоров С.С.', email: 'sidorov@example.com', phone: '+998901234569', ip_phone: '1003', dob: null, organization: null, department: { id: 3, name: 'Техническая служба', description: '', organization_id: id }, position: { id: 3, description: 'Инженер' }, icon: undefined }
        ] as GesContact[]).pipe(delay(150));
    }

    getShutdowns(id: number, dateRange?: DateRangeParams): Observable<GesShutdown[]> {
        return of([
            { id: 1, organization_id: id, organization_name: MOCK_GES_INFO[id]?.name ?? `Молокозавод №${id}`, started_at: hoursAgo(5), ended_at: hoursAgo(2), reason: 'Плановое техобслуживание линии пастеризации', created_by: { id: 1, name: 'Иванов И.И.' }, generation_loss: 1500, idle_discharge_volume: null, files: [] },
            { id: 2, organization_id: id, organization_name: MOCK_GES_INFO[id]?.name ?? `Молокозавод №${id}`, started_at: hoursAgo(24), ended_at: hoursAgo(20), reason: 'Замена фильтра на линии розлива', created_by: { id: 2, name: 'Петров П.П.' }, generation_loss: 800, idle_discharge_volume: null, files: [] }
        ] as GesShutdown[]).pipe(delay(150));
    }

    getDischarges(id: number, dateRange?: DateRangeParams): Observable<GesDischarge[]> {
        return of([
            { id: 1, organization: { id, name: MOCK_GES_INFO[id]?.name ?? `Молокозавод №${id}`, contacts: [] }, created_by: { id: 1, name: 'Иванов И.И.' }, approved_by: null, started_at: hoursAgo(3), ended_at: null, flow_rate: 25, total_volume: 150, reason: 'Истечение срока годности партии №1234', is_ongoing: true, approved: null, files: [] },
            { id: 2, organization: { id, name: MOCK_GES_INFO[id]?.name ?? `Молокозавод №${id}`, contacts: [] }, created_by: { id: 2, name: 'Петров П.П.' }, approved_by: { id: 10, name: 'Менеджер Алиев А.А.' }, started_at: hoursAgo(8), ended_at: hoursAgo(5), flow_rate: 15, total_volume: 100, reason: 'Брак при производстве', is_ongoing: false, approved: true, files: [] }
        ] as GesDischarge[]).pipe(delay(150));
    }

    getIncidents(id: number, dateRange?: DateRangeParams): Observable<GesIncident[]> {
        return of([
            { id: 1, incident_date: hoursAgo(6), description: 'Сбой в системе охлаждения', organization_id: id, organization: MOCK_GES_INFO[id]?.name ?? `Молокозавод №${id}`, created_by: { id: 1, name: 'Иванов И.И.' }, files: [] }
        ] as GesIncident[]).pipe(delay(150));
    }

    getVisits(id: number, dateRange?: DateRangeParams): Observable<GesVisit[]> {
        return of([
            { id: 1, organization_id: id, organization_name: MOCK_GES_INFO[id]?.name ?? `Молокозавод №${id}`, visit_date: new Date().toISOString().split('T')[0], description: 'Плановая проверка', responsible_name: 'Каримов К.К.', created_by: { id: 1, name: 'Иванов И.И.' }, files: [] }
        ] as GesVisit[]).pipe(delay(150));
    }

    getTelemetry(id: number): Observable<TelemetryEnvelope[]> {
        const ts = now();
        return of([
            {
                id: '1', station_id: String(id), station_name: MOCK_GES_INFO[id]?.name ?? `Молокозавод №${id}`, timestamp: ts,
                device_id: '1', device_name: 'Производственная линия 1', device_group: 'generators',
                values: [
                    { name: 'active_power_kw', value: 4500, unit: 'kW', quality: 'good', severity: 'normal' },
                    { name: 'reactive_power_kvar', value: 1200, unit: 'kVAr', quality: 'good', severity: 'normal' },
                    { name: 'voltage_ab', value: 10.5, unit: 'kV', quality: 'good', severity: 'normal' },
                    { name: 'voltage_bc', value: 10.4, unit: 'kV', quality: 'good', severity: 'normal' },
                    { name: 'voltage_ca', value: 10.6, unit: 'kV', quality: 'good', severity: 'normal' },
                    { name: 'current_a', value: 245, unit: 'A', quality: 'good', severity: 'normal' },
                    { name: 'current_b', value: 248, unit: 'A', quality: 'good', severity: 'normal' },
                    { name: 'current_c', value: 242, unit: 'A', quality: 'good', severity: 'normal' },
                    { name: 'frequency', value: 50.01, unit: 'Hz', quality: 'good', severity: 'normal' },
                    { name: 'power_factor', value: 0.96, unit: '', quality: 'good', severity: 'normal' }
                ]
            },
            {
                id: '2', station_id: String(id), station_name: MOCK_GES_INFO[id]?.name ?? `Молокозавод №${id}`, timestamp: ts,
                device_id: '2', device_name: 'Производственная линия 2', device_group: 'generators',
                values: [
                    { name: 'active_power_kw', value: 3800, unit: 'kW', quality: 'good', severity: 'normal' },
                    { name: 'reactive_power_kvar', value: 1050, unit: 'kVAr', quality: 'good', severity: 'normal' },
                    { name: 'voltage_ab', value: 10.5, unit: 'kV', quality: 'good', severity: 'normal' },
                    { name: 'voltage_bc', value: 10.5, unit: 'kV', quality: 'good', severity: 'normal' },
                    { name: 'voltage_ca', value: 10.4, unit: 'kV', quality: 'good', severity: 'normal' },
                    { name: 'current_a', value: 210, unit: 'A', quality: 'good', severity: 'normal' },
                    { name: 'current_b', value: 212, unit: 'A', quality: 'good', severity: 'normal' },
                    { name: 'current_c', value: 208, unit: 'A', quality: 'good', severity: 'normal' },
                    { name: 'frequency', value: 50.00, unit: 'Hz', quality: 'good', severity: 'normal' },
                    { name: 'power_factor', value: 0.95, unit: '', quality: 'good', severity: 'normal' }
                ]
            },
            {
                id: '3', station_id: String(id), station_name: MOCK_GES_INFO[id]?.name ?? `Молокозавод №${id}`, timestamp: ts,
                device_id: '3', device_name: 'Производственная линия 3', device_group: 'generators',
                values: [
                    { name: 'active_power_kw', value: 0, unit: 'kW', quality: 'good', severity: 'normal' },
                    { name: 'reactive_power_kvar', value: 0, unit: 'kVAr', quality: 'good', severity: 'normal' },
                    { name: 'voltage_ab', value: 0, unit: 'kV', quality: 'good', severity: 'normal' },
                    { name: 'frequency', value: 0, unit: 'Hz', quality: 'good', severity: 'normal' }
                ]
            }
        ] as TelemetryEnvelope[]).pipe(delay(200));
    }

    getDeviceTelemetry(id: number, deviceId: string): Observable<TelemetryEnvelope> {
        return this.getTelemetry(id).pipe(delay(100)) as any;
    }

    getAskue(id: number): Observable<ASCUEMetrics> {
        return of({
            active: 8.3,
            reactive: 2.25,
            power_import: 0,
            power_export: 0.5,
            own_needs: 0.3,
            flow: 120,
            active_agg_count: 2,
            pending_agg_count: 1,
            repair_agg_count: 0
        }).pipe(delay(150));
    }

    addShutdown(gesId: number, formData: FormData): Observable<any> {
        return of({ id: Date.now(), success: true }).pipe(delay(300));
    }

    editShutdown(gesId: number, shutdownId: number, formData: FormData): Observable<any> {
        return of({ id: shutdownId, success: true }).pipe(delay(300));
    }

    deleteShutdown(gesId: number, shutdownId: number): Observable<any> {
        return of({ success: true }).pipe(delay(200));
    }

    addDischarge(gesId: number, formData: FormData): Observable<any> {
        return of({ id: Date.now(), success: true }).pipe(delay(300));
    }

    editDischarge(gesId: number, dischargeId: number, formData: FormData): Observable<any> {
        return of({ id: dischargeId, success: true }).pipe(delay(300));
    }

    deleteDischarge(gesId: number, dischargeId: number): Observable<any> {
        return of({ success: true }).pipe(delay(200));
    }

    addIncident(gesId: number, formData: FormData): Observable<any> {
        return of({ id: Date.now(), success: true }).pipe(delay(300));
    }

    editIncident(gesId: number, incidentId: number, formData: FormData): Observable<any> {
        return of({ id: incidentId, success: true }).pipe(delay(300));
    }

    deleteIncident(gesId: number, incidentId: number): Observable<any> {
        return of({ success: true }).pipe(delay(200));
    }

    addVisit(gesId: number, formData: FormData): Observable<any> {
        return of({ id: Date.now(), success: true }).pipe(delay(300));
    }

    editVisit(gesId: number, visitId: number, formData: FormData): Observable<any> {
        return of({ id: visitId, success: true }).pipe(delay(300));
    }

    deleteVisit(gesId: number, visitId: number): Observable<any> {
        return of({ success: true }).pipe(delay(200));
    }
}
