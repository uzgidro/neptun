import { Injectable } from '@angular/core';
import { ApiService } from '@/core/services/api.service';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { PatchReservoirDeviceSummaryRequest, ReservoirDeviceSummaryResponse } from '@/core/interfaces/reservoir-device';

const RESERVOIR_DEVICE = '/reservoir-device';

@Injectable({
  providedIn: 'root'
})
export class ReservoirDeviceService extends ApiService {

  getReservoirDevices(date?: Date): Observable<ReservoirDeviceSummaryResponse[]> {
    let params = new HttpParams();
    if (date) {
      params = params.set('date', this.dateToYMD(date));
    }
    return this.http.get<ReservoirDeviceSummaryResponse[]>(this.BASE_URL + RESERVOIR_DEVICE, { params });
  }

  patchReservoirDevices(payload: PatchReservoirDeviceSummaryRequest): Observable<any> {
    return this.http.patch(this.BASE_URL + RESERVOIR_DEVICE, payload);
  }
}
