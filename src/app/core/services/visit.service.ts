import { Injectable } from '@angular/core';
import { ApiService, BASE_URL } from '@/core/services/api.service';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { AddVisitRequest, EditVisitRequest, VisitDto, VisitResponse } from '@/core/interfaces/visits';
import { map } from 'rxjs/operators';

const VISITS = '/visits';

@Injectable({
  providedIn: 'root'
})
export class VisitService extends ApiService {
  getVisits(date?: Date): Observable<VisitDto[]> {
    let params = new HttpParams();
    if (date) {
      params = params.set('date', this.dateToYMD(date));
    }
    return this.http.get<VisitResponse[]>(BASE_URL + VISITS, { params: params }).pipe(
      map(responseArray => {
        if (!responseArray) {
          return [];
        }

        return responseArray.map(rawVisit => {
          return {
            ...rawVisit,
            visit_date: new Date(rawVisit.visit_date),
            created_at: new Date(rawVisit.created_at)
          };
        });
      })
    );
  }

  addVisit(payload: AddVisitRequest): Observable<any> {
    return this.http.post(BASE_URL + VISITS, payload);
  }

  editVisit(id: number, payload: EditVisitRequest): Observable<any> {
    return this.http.patch(`${BASE_URL}${VISITS}/${id}`, payload);
  }

  deleteVisit(id: number): Observable<any> {
    return this.http.delete(`${BASE_URL}${VISITS}/${id}`);
  }
}
