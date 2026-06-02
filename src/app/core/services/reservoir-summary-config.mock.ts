import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';

import { ReservoirSummaryConfig, ReservoirSummaryConfigPayload } from '@/core/interfaces/reservoir-summary-config';
import { ReservoirSummaryConfigSource } from '@/core/services/reservoir-summary-config.source';

const MOCK_DELAY_MS = 200;

// NOTE: no `providedIn: 'root'` — provided explicitly in app.config.ts as Phase-A
// data source. Phase B replaces it with a real HTTP service; without this constraint
// the mock would tree-shake into production bundles.
@Injectable()
export class MockReservoirSummaryConfigService implements ReservoirSummaryConfigSource {
    private store: ReservoirSummaryConfig[] = [
        { id: 1, organization_id: 101, organization_name: 'Андижон',     sort_order: 1, include_in_total: true  },
        { id: 2, organization_id: 102, organization_name: 'Охангарон',   sort_order: 2, include_in_total: true  },
        { id: 3, organization_id: 103, organization_name: 'Сардоба',     sort_order: 3, include_in_total: true  },
        { id: 4, organization_id: 104, organization_name: 'Хисорак',     sort_order: 4, include_in_total: true  },
        { id: 5, organization_id: 105, organization_name: 'Топаланг',    sort_order: 5, include_in_total: true  },
        { id: 6, organization_id: 106, organization_name: 'Чорвок',      sort_order: 6, include_in_total: true  },
        { id: 7, organization_id: 107, organization_name: 'Қуйи Чоткол', sort_order: 7, include_in_total: true  },
        { id: 8, organization_id: 108, organization_name: 'Пском',       sort_order: 8, include_in_total: false }
    ];
    private nextId = 9;

    getConfigs(): Observable<ReservoirSummaryConfig[]> {
        const snapshot = this.store
            .slice()
            .sort((a, b) => a.sort_order - b.sort_order)
            .map(c => ({ ...c }));
        return of(snapshot).pipe(delay(MOCK_DELAY_MS));
    }

    upsertConfig(p: ReservoirSummaryConfigPayload): Observable<{ status: string }> {
        const idx = this.store.findIndex(c => c.organization_id === p.organization_id);
        if (idx >= 0) {
            this.store[idx] = {
                ...this.store[idx],
                sort_order: p.sort_order,
                include_in_total: p.include_in_total
            };
        } else {
            this.store.push({
                id: this.nextId++,
                organization_id: p.organization_id,
                organization_name: `Org #${p.organization_id}`,
                sort_order: p.sort_order,
                include_in_total: p.include_in_total
            });
        }
        return of({ status: 'OK' }).pipe(delay(MOCK_DELAY_MS));
    }

    deleteConfig(organizationId: number): Observable<void> {
        const before = this.store.length;
        this.store = this.store.filter(c => c.organization_id !== organizationId);
        if (this.store.length === before) {
            return throwError(() => new HttpErrorResponse({ status: 404, statusText: 'Not Found' }));
        }
        return of(void 0).pipe(delay(MOCK_DELAY_MS));
    }
}
