import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ApiService } from '../api.service';
import { ConfigService } from '../config.service';

describe('ApiService', () => {
    let service: ApiService;
    let httpMock: HttpTestingController;
    const BASE_URL = 'https://test-api.example.com';

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                provideHttpClient(),
                provideHttpClientTesting(),
                { provide: ConfigService, useValue: { apiBaseUrl: BASE_URL } }
            ]
        });
        service = TestBed.inject(ApiService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('uploadFiles', () => {
        it('should POST multipart to /upload/files with files and category_id', () => {
            const file1 = new File(['content1'], 'photo1.jpg', { type: 'image/jpeg' });
            const file2 = new File(['content2'], 'photo2.jpg', { type: 'image/jpeg' });

            service.uploadFiles([file1, file2], 5).subscribe((result) => {
                expect(result.ids).toEqual([42, 43]);
            });

            const req = httpMock.expectOne(`${BASE_URL}/upload/files`);
            expect(req.request.method).toBe('POST');
            expect(req.request.body instanceof FormData).toBeTrue();
            expect(req.request.body.get('category_id')).toBe('5');
            expect(req.request.body.getAll('files').length).toBe(2);
            expect(req.request.body.has('date')).toBeFalse();
            req.flush({ ids: [42, 43], uploaded_files: [{ id: 42, file_name: 'photo1.jpg' }, { id: 43, file_name: 'photo2.jpg' }] });
        });

        it('should include date param when provided', () => {
            const file = new File(['content'], 'doc.pdf', { type: 'application/pdf' });

            service.uploadFiles([file], 3, '2026-04-08').subscribe();

            const req = httpMock.expectOne(`${BASE_URL}/upload/files`);
            expect(req.request.body.get('date')).toBe('2026-04-08');
            expect(req.request.body.get('category_id')).toBe('3');
            req.flush({ id: 42, uploaded_files: [{ id: 42, file_name: 'doc.pdf' }] });
        });

        it('should normalize single-file response (id -> ids array)', () => {
            const file = new File(['content'], 'single.pdf', { type: 'application/pdf' });

            service.uploadFiles([file], 1).subscribe((result) => {
                expect(result.ids).toEqual([42]);
            });

            const req = httpMock.expectOne(`${BASE_URL}/upload/files`);
            req.flush({ id: 42, uploaded_files: [{ id: 42, file_name: 'single.pdf' }] });
        });

        it('should normalize multi-file response (ids array)', () => {
            const file1 = new File(['a'], 'a.jpg', { type: 'image/jpeg' });
            const file2 = new File(['b'], 'b.jpg', { type: 'image/jpeg' });

            service.uploadFiles([file1, file2], 1).subscribe((result) => {
                expect(result.ids).toEqual([10, 11, 12]);
            });

            const req = httpMock.expectOne(`${BASE_URL}/upload/files`);
            req.flush({ ids: [10, 11, 12], uploaded_files: [] });
        });
    });
});
