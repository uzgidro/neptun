import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { ApiService } from './api.service';
import {
    Location,
    Piezometer,
    CreateLocationRequest,
    UpdateLocationRequest,
    CreatePiezometerRequest,
    UpdatePiezometerRequest,
    PiezometerCountsRecord,
    UpsertPiezometerCountsRequest
} from '@/core/interfaces/filtration';

const FILTRATION = '/filtration';
const LOCATIONS = '/locations';
const PIEZOMETERS = '/piezometers';
const PIEZOMETER_COUNTS = '/piezometer-counts';

@Injectable({ providedIn: 'root' })
export class FiltrationService extends ApiService {

    // Locations
    getLocations(organizationId: number): Observable<Location[]> {
        const params = new HttpParams().set('organization_id', organizationId);
        return this.http.get<Location[]>(`${this.BASE_URL}${FILTRATION}${LOCATIONS}`, { params });
    }

    createLocation(payload: CreateLocationRequest): Observable<any> {
        return this.http.post(`${this.BASE_URL}${FILTRATION}${LOCATIONS}`, payload);
    }

    updateLocation(id: number, payload: UpdateLocationRequest): Observable<{ status: string }> {
        return this.http.patch<{ status: string }>(`${this.BASE_URL}${FILTRATION}${LOCATIONS}/${id}`, payload);
    }

    deleteLocation(id: number): Observable<{ status: string }> {
        return this.http.delete<{ status: string }>(`${this.BASE_URL}${FILTRATION}${LOCATIONS}/${id}`);
    }

    // Piezometers
    getPiezometers(organizationId: number): Observable<Piezometer[]> {
        const params = new HttpParams().set('organization_id', organizationId);
        return this.http.get<Piezometer[]>(`${this.BASE_URL}${FILTRATION}${PIEZOMETERS}`, { params });
    }

    createPiezometer(payload: CreatePiezometerRequest): Observable<any> {
        return this.http.post(`${this.BASE_URL}${FILTRATION}${PIEZOMETERS}`, payload);
    }

    updatePiezometer(id: number, payload: UpdatePiezometerRequest): Observable<{ status: string }> {
        return this.http.patch<{ status: string }>(`${this.BASE_URL}${FILTRATION}${PIEZOMETERS}/${id}`, payload);
    }

    deletePiezometer(id: number): Observable<{ status: string }> {
        return this.http.delete<{ status: string }>(`${this.BASE_URL}${FILTRATION}${PIEZOMETERS}/${id}`);
    }

    // Piezometer counts
    getPiezometerCounts(organizationId: number): Observable<PiezometerCountsRecord> {
        const params = new HttpParams().set('organization_id', organizationId);
        return this.http.get<PiezometerCountsRecord>(`${this.BASE_URL}${FILTRATION}${PIEZOMETER_COUNTS}`, { params });
    }

    upsertPiezometerCounts(payload: UpsertPiezometerCountsRequest): Observable<{ status: string }> {
        return this.http.post<{ status: string }>(`${this.BASE_URL}${FILTRATION}${PIEZOMETER_COUNTS}`, payload);
    }
}
