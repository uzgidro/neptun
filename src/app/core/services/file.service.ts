import { Injectable } from '@angular/core';
import { ApiService } from '@/core/services/api.service';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { FileResponse } from '@/core/interfaces/files';

@Injectable({
    providedIn: 'root'
})
export class FileService extends ApiService {
    getFileByCategory(category: string, date?: Date): Observable<FileResponse> {
        // Мок-данные для файлов
        const mockFile: FileResponse = {
            id: 1,
            file_name: `report_${category}_${this.dateToYMD(date || new Date())}.pdf`,
            category_id: 1,
            mime_type: 'application/pdf',
            size_bytes: 1024000,
            url: '/assets/mock/sample.pdf',
            created_at: new Date().toISOString()
        };
        return of(mockFile).pipe(delay(200));
    }
}
