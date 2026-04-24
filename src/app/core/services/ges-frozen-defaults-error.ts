import { HttpErrorResponse } from '@angular/common/http';

export interface FrozenDefaultErrorMessage {
    key: string;
    params?: Record<string, unknown>;
}

export function parseFrozenDefaultError(err: HttpErrorResponse): FrozenDefaultErrorMessage {
    const status = err?.status ?? 0;
    const raw =
        (typeof err?.error === 'string' ? err.error : '') ||
        (err?.error?.error as string | undefined) ||
        (err?.error?.message as string | undefined) ||
        err?.message || '';
    const hint = raw.toLowerCase();

    if (status === 400) {
        if (hint.includes('field_name') || hint.includes('oneof')) {
            return { key: 'GES_REPORT.FROZEN.ERROR.INVALID_FIELD_NAME' };
        }
        if (hint.includes('gte') || hint.includes('< 0') || hint.includes('negative')) {
            return { key: 'GES_REPORT.FROZEN.ERROR.VALUE_NEGATIVE' };
        }
        if (hint.includes('integer') || hint.includes('aggregate')) {
            return { key: 'GES_REPORT.FROZEN.ERROR.VALUE_NOT_INTEGER' };
        }
        return { key: 'GES_REPORT.FROZEN.ERROR.INVALID', params: { details: raw } };
    }
    if (status === 401) return { key: 'GES_REPORT.FROZEN.ERROR.SESSION_EXPIRED' };
    if (status === 403) return { key: 'GES_REPORT.FROZEN.ERROR.FORBIDDEN' };
    if (status >= 500)  return { key: 'GES_REPORT.FROZEN.ERROR.SERVER' };
    return { key: 'GES_REPORT.FROZEN.ERROR.UNKNOWN' };
}
