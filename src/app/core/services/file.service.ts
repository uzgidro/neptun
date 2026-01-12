import { Injectable } from '@angular/core';
import { ApiService, BASE_URL } from '@/core/services/api.service';
import { Observable } from 'rxjs';
import { FileResponse } from '@/core/interfaces/files';

const FILES = '/files';

@Injectable({
    providedIn: 'root'
})
export class FileService extends ApiService {
    getFileByCategory(category: string, date?: Date): Observable<FileResponse> {
        let dateParam = date ? date : new Date();

        return this.http.get<FileResponse>(BASE_URL + FILES, {
            params: {
                category: category,
                date: this.dateToYMD(dateParam)
            }
        });
    }
}
