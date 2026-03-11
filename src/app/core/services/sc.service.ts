import { Injectable } from '@angular/core';
import { ApiService } from '@/core/services/api.service';
import { Observable } from 'rxjs';
import { HttpResponse } from '@angular/common/http';

const SC = '/sc';

@Injectable({
    providedIn: 'root'
})
export class ScService extends ApiService {
    downloadScReport(date: Date, format: 'excel' | 'pdf'): Observable<HttpResponse<Blob>> {
        return this.http.get(this.BASE_URL + SC + '/export', {
            params: {
                date: this.dateToYMD(date),
                format: format
            },
            responseType: 'blob',
            observe: 'response'
        });
    }
}
