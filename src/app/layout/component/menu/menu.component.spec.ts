import { TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { AuthService } from '@/core/services/auth.service';
import { MenuItems } from '@/core/interfaces/menuitems';
import { MenuComponent } from './menu.component';

describe('MenuComponent', () => {
    let authServiceSpy: jasmine.SpyObj<AuthService>;

    const labels = (items: MenuItems[]): string[] =>
        items.flatMap((i) => [i.label ?? '', ...labels((i.items as MenuItems[]) ?? [])]);

    const build = (): MenuItems[] => {
        const menu = TestBed.runInInjectionContext(() => new MenuComponent());
        menu.ngOnInit();
        return menu.model;
    };

    beforeEach(() => {
        authServiceSpy = jasmine.createSpyObj('AuthService', ['isOnlyCascade', 'isOnlyReservoirDuty', 'canSeeOverview']);
        authServiceSpy.isOnlyCascade.and.returnValue(false);
        authServiceSpy.isOnlyReservoirDuty.and.returnValue(false);

        TestBed.configureTestingModule({
            providers: [
                { provide: AuthService, useValue: authServiceSpy },
                { provide: TranslateService, useValue: { instant: (k: string) => k, onLangChange: new Subject() } }
            ]
        });
    });

    it('hides situation center, HR and financial blocks', () => {
        const all = labels(build());
        expect(all).not.toContain('MENU.SITUATION_CENTER');
        expect(all).not.toContain('MENU.HRM');
        expect(all).not.toContain('MENU.FINANCIAL');
    });

    it('keeps administration items that lived under HR', () => {
        const all = labels(build());
        expect(all).toContain('MENU.ADMINISTRATION');
        expect(all).toContain('MENU.USERS');
        expect(all).toContain('MENU.ROLES');
        expect(all).toContain('MENU.ORGANIZATIONS');
        expect(all).toContain('MENU.ORGANIZATION_TYPES');
    });

    it('keeps other blocks visible', () => {
        const all = labels(build());
        expect(all).toContain('MENU.CHANCELLERY');
        expect(all).toContain('MENU.LEGAL_LIBRARY');
        expect(all).toContain('MENU.INVESTMENT_BLOCK');
    });
});
