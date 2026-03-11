import { Injectable } from '@angular/core';
import { ApiService } from '@/core/services/api.service';
import { Observable } from 'rxjs';
import { PatchReservoirDeviceSummaryRequest, ReservoirDeviceSummaryResponse } from '@/core/interfaces/reservoir-device';

const RESERVOIR_DEVICE = '/reservoir-device';

@Injectable({
  providedIn: 'root'
})
export class ReservoirDeviceService extends ApiService {

  getReservoirDevices(): Observable<ReservoirDeviceSummaryResponse[]> {
    return this.http.get<ReservoirDeviceSummaryResponse[]>(this.BASE_URL + RESERVOIR_DEVICE);
  }

  patchReservoirDevices(payload: PatchReservoirDeviceSummaryRequest): Observable<any> {
    return this.http.patch(this.BASE_URL + RESERVOIR_DEVICE, payload);
  }
}
