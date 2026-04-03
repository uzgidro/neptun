import { TestBed } from '@angular/core/testing';
import { HttpClient, HttpErrorResponse, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { MessageService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';
import { errorInterceptor } from './error.interceptor';

describe('errorInterceptor', () => {
    let httpClient: HttpClient;
    let httpMock: HttpTestingController;
    let messageService: jasmine.SpyObj<MessageService>;
    let translateService: jasmine.SpyObj<TranslateService>;

    beforeEach(() => {
        messageService = jasmine.createSpyObj('MessageService', ['add']);
        translateService = jasmine.createSpyObj('TranslateService', ['instant']);
        translateService.instant.and.callFake((key: string) => key);

        TestBed.configureTestingModule({
            providers: [
                provideHttpClient(withInterceptors([errorInterceptor])),
                provideHttpClientTesting(),
                { provide: MessageService, useValue: messageService },
                { provide: TranslateService, useValue: translateService }
            ]
        });

        httpClient = TestBed.inject(HttpClient);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should pass through 409 errors without showing toast', () => {
        httpClient.post('/test', {}).subscribe({
            error: (err: HttpErrorResponse) => {
                expect(err.status).toBe(409);
            }
        });

        const req = httpMock.expectOne('/test');
        req.flush({ error: 'Conflict message' }, { status: 409, statusText: 'Conflict' });

        expect(messageService.add).not.toHaveBeenCalled();
    });

    it('should pass through 401 errors without showing toast', () => {
        httpClient.get('/test').subscribe({
            error: (err: HttpErrorResponse) => {
                expect(err.status).toBe(401);
            }
        });

        const req = httpMock.expectOne('/test');
        req.flush({}, { status: 401, statusText: 'Unauthorized' });

        expect(messageService.add).not.toHaveBeenCalled();
    });

    it('should pass through 403 errors without showing toast', () => {
        httpClient.get('/test').subscribe({
            error: (err: HttpErrorResponse) => {
                expect(err.status).toBe(403);
            }
        });

        const req = httpMock.expectOne('/test');
        req.flush({}, { status: 403, statusText: 'Forbidden' });

        expect(messageService.add).not.toHaveBeenCalled();
    });

    it('should show toast for 500 errors', () => {
        httpClient.get('/test').subscribe({
            error: () => {}
        });

        const req = httpMock.expectOne('/test');
        req.flush({}, { status: 500, statusText: 'Internal Server Error' });

        expect(messageService.add).toHaveBeenCalledWith(
            jasmine.objectContaining({
                severity: 'error',
                summary: 'COMMON.ERROR'
            })
        );
    });

    it('should show backend error message when available', () => {
        httpClient.get('/test').subscribe({
            error: () => {}
        });

        const req = httpMock.expectOne('/test');
        req.flush({ message: 'Custom backend error' }, { status: 400, statusText: 'Bad Request' });

        expect(messageService.add).toHaveBeenCalledWith(
            jasmine.objectContaining({
                detail: 'Custom backend error'
            })
        );
    });
});
