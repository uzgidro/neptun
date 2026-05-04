import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';

import { ReservoirFloodComponent } from './reservoir-flood.component';
import { AuthService } from '@/core/services/auth.service';
import { ReservoirFloodService } from '@/core/services/reservoir-flood.service';
import { OrganizationService } from '@/core/services/organization.service';
import { LevelVolumeService } from '@/core/services/level-volume.service';

describe('ReservoirFloodComponent — config-tab visibility', () => {
    let fixture: ComponentFixture<ReservoirFloodComponent>;
    let authSpy: jasmine.SpyObj<AuthService>;

    function setupBed(): void {
        const reservoirSvc = jasmine.createSpyObj('ReservoirFloodService',
            ['getConfigs', 'getHourly', 'upsertHourly', 'upsertConfig', 'deleteConfig']);
        reservoirSvc.getConfigs.and.returnValue(of([]));
        reservoirSvc.getHourly.and.returnValue(of([]));
        const orgSvc = jasmine.createSpyObj('OrganizationService', ['getOrganizationsFlat']);
        orgSvc.getOrganizationsFlat.and.returnValue(of([]));
        const levelVolume = jasmine.createSpyObj('LevelVolumeService', ['getVolume']);
        const messageService = jasmine.createSpyObj('MessageService', ['add']);
        const router = jasmine.createSpyObj('Router', ['navigate']);
        router.navigate.and.resolveTo(true);

        authSpy = jasmine.createSpyObj('AuthService', ['hasRole', 'isScOrRais']);
        authSpy.isScOrRais.and.returnValue(true);

        TestBed.configureTestingModule({
            imports: [ReservoirFloodComponent, TranslateModule.forRoot()],
            providers: [
                provideHttpClient(),
                provideHttpClientTesting(),
                provideNoopAnimations(),
                { provide: AuthService, useValue: authSpy },
                { provide: ReservoirFloodService, useValue: reservoirSvc },
                { provide: OrganizationService, useValue: orgSvc },
                { provide: LevelVolumeService, useValue: levelVolume },
                { provide: MessageService, useValue: messageService },
                { provide: Router, useValue: router },
                {
                    provide: ActivatedRoute,
                    useValue: {
                        queryParamMap: new BehaviorSubject(convertToParamMap({})).asObservable()
                    }
                }
            ]
        });
        fixture = TestBed.createComponent(ReservoirFloodComponent);
    }

    afterEach(() => TestBed.resetTestingModule());

    it('canEditConfig is true for sc', () => {
        setupBed();
        authSpy.hasRole.and.callFake((roles: string | string[]) =>
            Array.isArray(roles) ? roles.includes('sc') : roles === 'sc'
        );
        const component = fixture.componentInstance;
        expect(component.canEditConfig).toBeTrue();
    });

    it('canEditConfig is FALSE for rais (config is sc-only now)', () => {
        setupBed();
        authSpy.hasRole.and.callFake((roles: string | string[]) =>
            Array.isArray(roles) ? roles.includes('rais') : roles === 'rais'
        );
        const component = fixture.componentInstance;
        expect(component.canEditConfig).toBeFalse();
    });

    it('canEditConfig is false for reservoir_duty', () => {
        setupBed();
        authSpy.hasRole.and.callFake((roles: string | string[]) =>
            Array.isArray(roles) ? roles.includes('reservoir_duty') : roles === 'reservoir_duty'
        );
        const component = fixture.componentInstance;
        expect(component.canEditConfig).toBeFalse();
    });

    it('canEditConfig is false when no relevant role', () => {
        setupBed();
        authSpy.hasRole.and.returnValue(false);
        const component = fixture.componentInstance;
        expect(component.canEditConfig).toBeFalse();
    });
});
