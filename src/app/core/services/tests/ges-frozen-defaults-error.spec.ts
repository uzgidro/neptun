import { HttpErrorResponse } from '@angular/common/http';
import { parseFrozenDefaultError } from '../ges-frozen-defaults-error';

describe('parseFrozenDefaultError', () => {
    it('maps 400 with field_name hint to INVALID_FIELD_NAME', () => {
        const err = new HttpErrorResponse({
            status: 400,
            error: { error: 'field_name must be one of ...' },
        });
        expect(parseFrozenDefaultError(err)).toEqual({
            key: 'GES_REPORT.FROZEN.ERROR.INVALID_FIELD_NAME',
        });
    });

    it('maps 400 with gte=0 hint to VALUE_NEGATIVE', () => {
        const err = new HttpErrorResponse({
            status: 400,
            error: { error: 'frozen_value must be gte=0' },
        });
        expect(parseFrozenDefaultError(err)).toEqual({
            key: 'GES_REPORT.FROZEN.ERROR.VALUE_NEGATIVE',
        });
    });

    it('maps 400 with integer/aggregate hint to VALUE_NOT_INTEGER', () => {
        const err = new HttpErrorResponse({
            status: 400,
            error: { error: 'must be integer for aggregate field' },
        });
        expect(parseFrozenDefaultError(err)).toEqual({
            key: 'GES_REPORT.FROZEN.ERROR.VALUE_NOT_INTEGER',
        });
    });

    it('maps 400 with arbitrary text to INVALID with details param', () => {
        const err = new HttpErrorResponse({
            status: 400,
            error: { error: 'something else' },
        });
        expect(parseFrozenDefaultError(err)).toEqual({
            key: 'GES_REPORT.FROZEN.ERROR.INVALID',
            params: { details: 'something else' },
        });
    });

    it('maps 401 to SESSION_EXPIRED', () => {
        const err = new HttpErrorResponse({ status: 401 });
        expect(parseFrozenDefaultError(err)).toEqual({
            key: 'GES_REPORT.FROZEN.ERROR.SESSION_EXPIRED',
        });
    });

    it('maps 403 to FORBIDDEN', () => {
        const err = new HttpErrorResponse({ status: 403 });
        expect(parseFrozenDefaultError(err)).toEqual({
            key: 'GES_REPORT.FROZEN.ERROR.FORBIDDEN',
        });
    });

    it('maps 500 to SERVER', () => {
        const err = new HttpErrorResponse({ status: 500 });
        expect(parseFrozenDefaultError(err)).toEqual({
            key: 'GES_REPORT.FROZEN.ERROR.SERVER',
        });
    });

    it('maps 0 (network error / no status) to UNKNOWN', () => {
        const err = new HttpErrorResponse({ status: 0 });
        expect(parseFrozenDefaultError(err)).toEqual({
            key: 'GES_REPORT.FROZEN.ERROR.UNKNOWN',
        });
    });
});
