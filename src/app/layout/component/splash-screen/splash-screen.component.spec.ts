import { ComponentFixture, TestBed, discardPeriodicTasks, fakeAsync, tick } from '@angular/core/testing';
import { LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeRu from '@angular/common/locales/ru';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { SplashScreenComponent } from './splash-screen.component';

describe('SplashScreenComponent', () => {
    let fixture: ComponentFixture<SplashScreenComponent>;

    beforeEach(() => {
        registerLocaleData(localeRu);
        TestBed.configureTestingModule({
            imports: [SplashScreenComponent],
            providers: [provideNoopAnimations(), { provide: LOCALE_ID, useValue: 'ru' }]
        });
        fixture = TestBed.createComponent(SplashScreenComponent);
    });

    it('counts up to the 2025 annual output of 30.1 bn kWh', fakeAsync(() => {
        fixture.detectChanges();
        tick(3000);
        fixture.detectChanges();

        expect(fixture.componentInstance.currentPower).toBe(30.1);
        const text = fixture.nativeElement.querySelector('.power-display').textContent.replace(/\s+/g, ' ');
        expect(text).toContain('30,1');
        expect(text).toContain('млрд кВт·ч');
        expect(text).toContain('Выработано электроэнергии за 2025 год');

        fixture.componentInstance.skipSplash();
        tick(600);
        discardPeriodicTasks();
    }));
});
