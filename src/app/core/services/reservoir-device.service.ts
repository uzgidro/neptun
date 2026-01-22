import { Injectable } from '@angular/core';
import { ApiService } from '@/core/services/api.service';
import { Observable, of, delay } from 'rxjs';
import { PatchReservoirDeviceSummaryRequest, ReservoirDeviceSummaryResponse } from '@/core/interfaces/reservoir-device';

@Injectable({
  providedIn: 'root'
})
export class ReservoirDeviceService extends ApiService {
  // Mock data for storage equipment (производственное оборудование)
  getReservoirDevices(): Observable<ReservoirDeviceSummaryResponse[]> {
    const mockData: ReservoirDeviceSummaryResponse[] = [
      {
        id: 1,
        organization_id: 1,
        organization_name: 'Резервуар хранения №1',
        device_type_name: 'Датчики температуры',
        count_total: 24,
        count_installed: 24,
        count_operational: 22,
        count_faulty: 2,
        count_active: 22,
        count_automation_scope: 24,
        criterion_1: 95,
        criterion_2: 98,
        created_at: new Date().toISOString()
      },
      {
        id: 2,
        organization_id: 1,
        organization_name: 'Резервуар хранения №1',
        device_type_name: 'Датчики уровня',
        count_total: 8,
        count_installed: 8,
        count_operational: 8,
        count_faulty: 0,
        count_active: 8,
        count_automation_scope: 8,
        criterion_1: 100,
        criterion_2: 100,
        created_at: new Date().toISOString()
      },
      {
        id: 3,
        organization_id: 2,
        organization_name: 'Резервуар хранения №2',
        device_type_name: 'Датчики температуры',
        count_total: 16,
        count_installed: 16,
        count_operational: 15,
        count_faulty: 1,
        count_active: 15,
        count_automation_scope: 16,
        criterion_1: 94,
        criterion_2: 97,
        created_at: new Date().toISOString()
      },
      {
        id: 4,
        organization_id: 2,
        organization_name: 'Резервуар хранения №2',
        device_type_name: 'Насосное оборудование',
        count_total: 4,
        count_installed: 4,
        count_operational: 4,
        count_faulty: 0,
        count_active: 4,
        count_automation_scope: 4,
        criterion_1: 100,
        criterion_2: 100,
        created_at: new Date().toISOString()
      }
    ];
    return of(mockData).pipe(delay(200));
  }

  patchReservoirDevices(payload: PatchReservoirDeviceSummaryRequest): Observable<any> {
    return of({ success: true, updated: payload.updates.length }).pipe(delay(300));
  }
}
