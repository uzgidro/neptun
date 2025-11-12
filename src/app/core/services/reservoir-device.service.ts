import { Injectable } from '@angular/core';
import { ApiService, BASE_URL } from '@/core/services/api.service';
import { Observable } from 'rxjs';
import { PatchReservoirDeviceSummaryRequest, ReservoirDeviceSummaryResponse } from '@/core/interfaces/reservoir-device';

const RESERVOIR_DEVICE = '/reservoir-device';

@Injectable({
  providedIn: 'root'
})
export class ReservoirDeviceService extends ApiService {

  getReservoirDevices(): Observable<ReservoirDeviceSummaryResponse[]> {
    return this.http.get<ReservoirDeviceSummaryResponse[]>(BASE_URL + RESERVOIR_DEVICE);
  }

  patchReservoirDevices(payload: PatchReservoirDeviceSummaryRequest): Observable<any> {
    return this.http.patch(BASE_URL + RESERVOIR_DEVICE, payload);
  }
}
