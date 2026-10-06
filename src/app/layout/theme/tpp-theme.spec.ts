import { TestBed } from '@angular/core/testing';
import { LayoutService } from '@/layout/service/layout.service';
import { TPP_PRIMARY, TPP_SURFACE, TPP_THEME_NAME, tppLogo } from './tpp-theme';

describe('TPP theme', () => {
    it('anchors the primary palette on the logo blues', () => {
        expect(TPP_PRIMARY[500]).toBe('#486EB4');
        expect(TPP_PRIMARY[900]).toBe('#232866');
    });

    it('defines a full 0–950 surface scale', () => {
        expect(Object.keys(TPP_SURFACE)).toEqual(['0', '50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950']);
    });

    it('is the default primary and surface of the layout', () => {
        const config = TestBed.inject(LayoutService).layoutConfig();
        expect(config.primary).toBe(TPP_THEME_NAME);
        expect(config.surface).toBe(TPP_THEME_NAME);
    });

    it('picks the light logo for dark backgrounds', () => {
        expect(tppLogo(true)).toBe('assets/images/logo-tpp-light.svg');
        expect(tppLogo(false)).toBe('assets/images/logo-tpp.svg');
    });
});
