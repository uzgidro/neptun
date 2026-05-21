import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    FormBuilder,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
    Validators
} from '@angular/forms';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, forkJoin, merge, of } from 'rxjs';
import {
    catchError,
    debounceTime,
    distinctUntilChanged,
    filter,
    finalize,
    switchMap,
    takeUntil
} from 'rxjs/operators';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { DatePicker } from 'primeng/datepicker';
import { Select } from 'primeng/select';
import { Menu } from 'primeng/menu';
import { TooltipModule } from 'primeng/tooltip';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MenuItem, MessageService } from 'primeng/api';

import { ReservoirFloodService } from '@/core/services/reservoir-flood.service';
import { LevelVolumeService } from '@/core/services/level-volume.service';
import { AuthService } from '@/core/services/auth.service';
import { downloadBlob } from '@/core/utils/download';
import {
    ReservoirFloodConfig,
    ReservoirFloodHourlyPayload,
    ReservoirFloodHourlyRecord
} from '@/core/interfaces/reservoir-flood';

export interface HourlyRow {
    config: ReservoirFloodConfig;
    record: ReservoirFloodHourlyRecord | null;
    form: FormGroup;
    saving: boolean;
}

// Asia/Tashkent timezone helpers. Uzbekistan has not observed DST since
// the 2004 cabmin decree, so a hardcoded +05:00 offset is safe.
// TODO: extract to core/utils/tashkent-time.ts when a second consumer appears.

function tashkentDateParts(d: Date): { y: number; m: number; day: number } {
    const fmt = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Tashkent',
        year: 'numeric', month: '2-digit', day: '2-digit'
    });
    const parts = Object.fromEntries(fmt.formatToParts(d).map(p => [p.type, p.value]));
    return { y: +parts['year'], m: +parts['month'], day: +parts['day'] };
}

function tashkentMidnight(y: number, m: number, day: number): Date {
    // Tashkent midnight 00:00 = UTC 19:00 previous day. Build a moment that
    // any further tashkentDateParts() call resolves back to (y, m, day).
    return new Date(Date.UTC(y, m - 1, day, 0, 0, 0) - 5 * 3600 * 1000);
}

// Cyrillic letters (U+0400–U+04FF covers Russian + Uzbek Қ Ғ Ҳ Ў), plus
// punctuation common in ФИО ("А.Эргашев", "Ю. Мухаммад-Бобур"). Empty
// string allowed because the field is optional. Latin letters and digits
// are rejected.
const CYRILLIC_NAME_PATTERN = /^[Ѐ-ӿ\s.\-,'`’"()]*$/;

const HOURLY_FIELDS = [
    'water_level_m',
    'water_volume_mln_m3',
    'inflow_m3s',
    'outflow_m3s',
    'ges_flow_m3s',
    'idle_discharge_m3s',
    'duty_name',
    'capacity_mwt',
    'weather_condition',
    'temperature_c'
] as const;

@Component({
    selector: 'app-reservoir-flood-hourly-tab',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        TableModule,
        ButtonModule,
        InputNumberModule,
        InputTextModule,
        DatePicker,
        Select,
        Menu,
        TooltipModule,
        TranslateModule
    ],
    templateUrl: './hourly-tab.component.html',
    styleUrls: ['./hourly-tab.component.scss']
})
export class HourlyTabComponent implements OnInit, OnDestroy {
    private destroy$ = new Subject<void>();
    private rowsReset$ = new Subject<void>();

    private svc = inject(ReservoirFloodService);
    private levelVolumeService = inject(LevelVolumeService);
    private messageService = inject(MessageService);
    private translate = inject(TranslateService);
    private fb = inject(FormBuilder);
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private authService = inject(AuthService);

    selectedDate: Date = this.todayMidnight();
    selectedHour: number = new Date().getHours();
    configs: ReservoirFloodConfig[] = [];
    rows: HourlyRow[] = [];
    loading = false;
    savingAll = false;

    canExport = this.authService.isScOrRais();
    downloadingSel: 'excel' | 'pdf' | null = null;

    selExportItems: MenuItem[] = [
        {
            label: 'SITUATION_CENTER.RESERVOIR_FLOOD.DOWNLOAD_EXCEL',
            icon: 'pi pi-file-excel',
            command: () => this.downloadSel('excel')
        },
        {
            label: 'SITUATION_CENTER.RESERVOIR_FLOOD.DOWNLOAD_PDF',
            icon: 'pi pi-file-pdf',
            command: () => this.downloadSel('pdf')
        }
    ];

    readonly hourOptions = Array.from({ length: 24 }, (_, i) => ({
        label: i.toString().padStart(2, '0') + ':00',
        value: i
    }));

    readonly weatherOptions: string[] = [
        'очиқ',
        'кам булут',
        'булут',
        'кам ёмғир',
        'ёмғир',
        'туман',
        'кам қор',
        'қор'
    ];

    ngOnInit(): void {
        this.route.queryParamMap.pipe(takeUntil(this.destroy$)).subscribe(qp => {
            const dateParam = qp.get('date');
            const hourParam = qp.get('hour');
            const parsedDate = this.parseDateParam(dateParam);
            const parsedHour = this.parseHourParam(hourParam);
            const hadValidParams = parsedDate !== null && parsedHour !== null;

            this.selectedDate = parsedDate ?? this.todayMidnight();
            this.selectedHour = parsedHour ?? new Date().getHours();

            if (!hadValidParams) {
                this.router.navigate([], {
                    relativeTo: this.route,
                    queryParams: {
                        date: this.dateYMD(),
                        hour: String(this.selectedHour).padStart(2, '0')
                    },
                    queryParamsHandling: 'merge',
                    replaceUrl: true
                });
            }
            this.loadData();
        });
    }

    onHourChange(hour: number): void {
        if (hour === this.selectedHour) return;
        this.router.navigate([], {
            relativeTo: this.route,
            queryParams: { hour: String(hour).padStart(2, '0') },
            queryParamsHandling: 'merge'
        });
    }

    onDateChange(date: Date): void {
        if (!(date instanceof Date) || isNaN(date.getTime())) return;
        if (this.selectedDate instanceof Date) {
            const a = tashkentDateParts(date);
            const b = tashkentDateParts(this.selectedDate);
            if (a.y === b.y && a.m === b.m && a.day === b.day) return;
        }
        const { y, m, day } = tashkentDateParts(date);
        const ymd = `${String(y)}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        this.router.navigate([], {
            relativeTo: this.route,
            queryParams: { date: ymd },
            queryParamsHandling: 'merge'
        });
    }

    private parseDateParam(s: string | null): Date | null {
        if (!s) return null;
        const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
        if (!m) return null;
        const y = +m[1], mo = +m[2], d = +m[3];
        const date = tashkentMidnight(y, mo, d);
        if (isNaN(date.getTime())) return null;
        // Sanity check: round-trip through tashkentDateParts catches month=13, day=32, etc.
        const parts = tashkentDateParts(date);
        if (parts.y !== y || parts.m !== mo || parts.day !== d) return null;
        return date;
    }

    private parseHourParam(s: string | null): number | null {
        if (s === null) return null;
        const n = parseInt(s, 10);
        if (isNaN(n) || n < 0 || n > 23) return null;
        return n;
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
        this.rowsReset$.complete();
    }

    hasUnsavedChanges(): boolean {
        return this.rows.some(r => r.form.dirty);
    }

    hasDirtyRows(): boolean {
        return this.hasUnsavedChanges();
    }

    recordedAt(): string {
        // The selected hour is a wall-clock hour in Asia/Tashkent. Build the
        // corresponding UTC instant: Tashkent midnight (already a UTC instant)
        // plus the selected hour, then emit the canonical "...Z" form. For
        // hours 00:00–04:59 this correctly rolls the UTC date back one day.
        // Avoids browser-local drift when the user's machine is not in UTC+5.
        const { y, m, day } = tashkentDateParts(this.selectedDate ?? new Date());
        const midnight = tashkentMidnight(y, m, day);
        const instant = new Date(midnight.getTime() + this.selectedHour * 3600 * 1000);
        return instant.toISOString();
    }

    loadData(): void {
        this.rowsReset$.next();
        this.loading = true;
        // Server-side hour filter — backend returns at most one record per
        // organization for the requested [hour:00, hour:00+1h) window, so the
        // earlier post-filter via toHourStartUTC is no longer needed.
        forkJoin({
            configs: this.svc.getConfigs(),
            records: this.svc.getHourly(this.dateYMD(), this.selectedHour)
        })
            .pipe(
                takeUntil(this.destroy$),
                finalize(() => (this.loading = false))
            )
            .subscribe({
                next: ({ configs, records }) => {
                    this.configs = (configs || [])
                        .slice()
                        .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
                    this.rows = this.configs.map(cfg => {
                        const record = (records || []).find(
                            r => r.organization_id === cfg.organization_id
                        ) ?? null;
                        return {
                            config: cfg,
                            record,
                            form: this.createForm(record),
                            saving: false
                        };
                    });
                    this.rows.forEach(row => this.wireVolumeAutoFill(row));
                },
                error: () => {
                    this.messageService.add({
                        severity: 'error',
                        summary: this.translate.instant('COMMON.ERROR'),
                        detail: this.translate.instant('COMMON.LOAD_ERROR')
                    });
                }
            });
    }

    onRowBlur(row: HourlyRow): void {
        if (!row.form.dirty || row.form.invalid || row.saving) return;
        this.saveRow(row);
    }

    saveRow(row: HourlyRow): void {
        if (!row.form.dirty || row.form.invalid || row.saving) return;
        row.saving = true;
        const payload = this.buildPayload(row);
        this.svc
            .upsertHourly([payload])
            .pipe(
                finalize(() => (row.saving = false)),
                takeUntil(this.destroy$)
            )
            .subscribe({
                next: () => {
                    row.form.markAsPristine();
                    this.messageService.add({
                        severity: 'success',
                        summary: this.translate.instant('COMMON.SUCCESS'),
                        detail: this.translate.instant('SITUATION_CENTER.RESERVOIR_FLOOD.DATA_SAVED')
                    });
                },
                error: (err: HttpErrorResponse) =>
                    this.handleHourlyError(err, [{ row, payload }])
            });
    }

    saveAll(): void {
        const dirtyRows = this.rows.filter(r => r.form.dirty);
        if (!dirtyRows.length) return;
        if (dirtyRows.some(r => r.form.invalid)) {
            this.messageService.add({
                severity: 'warn',
                summary: this.translate.instant('COMMON.WARNING'),
                detail: this.translate.instant('COMMON.FORM_INVALID')
            });
            return;
        }
        const pairs = dirtyRows.map(r => ({ row: r, payload: this.buildPayload(r) }));
        this.savingAll = true;
        this.svc
            .upsertHourly(pairs.map(p => p.payload))
            .pipe(
                finalize(() => (this.savingAll = false)),
                takeUntil(this.destroy$)
            )
            .subscribe({
                next: () => {
                    pairs.forEach(p => p.row.form.markAsPristine());
                    this.messageService.add({
                        severity: 'success',
                        summary: this.translate.instant('COMMON.SUCCESS'),
                        detail: this.translate.instant('SITUATION_CENTER.RESERVOIR_FLOOD.DATA_SAVED')
                    });
                },
                error: (err: HttpErrorResponse) => this.handleHourlyError(err, pairs)
            });
    }

    downloadSel(format: 'excel' | 'pdf'): void {
        if (this.downloadingSel) return;
        const date = this.dateYMD();
        const hour = this.selectedHour;
        this.downloadingSel = format;
        this.svc.exportSel({ date, hour, format }).pipe(
            takeUntil(this.destroy$)
        ).subscribe({
            next: (response) => {
                const ext = format === 'pdf' ? 'pdf' : 'xlsx';
                const hh = String(hour).padStart(2, '0');
                const fallback = `ТЕЗКОР-МАЪЛУМОТ-${date}-${hh}.${ext}`;
                const filename = this.parseFilename(response) ?? fallback;
                if (response.body) downloadBlob(response.body, filename);
                this.downloadingSel = null;
            },
            error: (err: HttpErrorResponse) => {
                this.downloadingSel = null;
                this.handleExportError(err);
            }
        });
    }

    private parseFilename(
        response: HttpResponse<Blob> | { headers: { get(name: string): string | null } }
    ): string | null {
        const cd = response.headers.get('Content-Disposition');
        if (!cd) return null;
        // RFC 5987: filename*=UTF-8''<percent-encoded>. Prefer this over the
        // plain filename="..." form because the latter is Latin-1 by spec, so
        // raw UTF-8 bytes there render as mojibake (e.g. "ТЕЗКОР" → "Ð¢Ð_...").
        const star = cd.match(/filename\*\s*=\s*([^']*)'[^']*'([^;]+)/i);
        if (star) {
            try {
                return decodeURIComponent(star[2].trim());
            } catch {
                // fall through to plain filename
            }
        }
        const plain = cd.match(/filename\s*=\s*"?([^";]+)"?/i);
        if (!plain) return null;
        const value = plain[1].trim();
        // Heuristic: if the plain filename looks like raw UTF-8 misread as
        // Latin-1, recover via escape→decodeURIComponent. Latin-1 letters in
        // the C1/extended range (0x80+) are the tell — pure ASCII passes
        // through unchanged.
        if (/[-ÿ]/.test(value)) {
            try {
                return decodeURIComponent(escape(value));
            } catch {
                return value;
            }
        }
        return value;
    }

    private handleExportError(err: HttpErrorResponse): void {
        let detail: string = this.translate.instant('COMMON.ERROR');
        if (err.status === 403) {
            detail = this.translate.instant(
                'SITUATION_CENTER.RESERVOIR_FLOOD.ERROR_FORBIDDEN_ORG'
            );
        }
        this.messageService.add({
            severity: 'error',
            summary: this.translate.instant('COMMON.ERROR'),
            detail
        });
    }

    buildPayload(row: HourlyRow): ReservoirFloodHourlyPayload {
        const p: any = {
            organization_id: row.config.organization_id,
            recorded_at: this.recordedAt()
        };
        for (const f of HOURLY_FIELDS) {
            const ctrl = row.form.get(f);
            if (ctrl?.dirty) p[f] = ctrl.value;
        }
        return p as ReservoirFloodHourlyPayload;
    }

    private createForm(rec: ReservoirFloodHourlyRecord | null): FormGroup {
        return this.fb.group({
            water_level_m: [rec?.water_level_m ?? null, [Validators.min(0)]],
            water_volume_mln_m3: [rec?.water_volume_mln_m3 ?? null, [Validators.min(0)]],
            inflow_m3s: [rec?.inflow_m3s ?? null, [Validators.min(0)]],
            outflow_m3s: [rec?.outflow_m3s ?? null, [Validators.min(0)]],
            ges_flow_m3s: [rec?.ges_flow_m3s ?? null, [Validators.min(0)]],
            idle_discharge_m3s: [rec?.idle_discharge_m3s ?? null, [Validators.min(0)]],
            duty_name: [rec?.duty_name ?? null, [Validators.pattern(CYRILLIC_NAME_PATTERN)]],
            capacity_mwt: [rec?.capacity_mwt ?? null, [Validators.min(0)]],
            weather_condition: [rec?.weather_condition ?? null],
            temperature_c: [rec?.temperature_c ?? null]
        });
    }

    private wireVolumeAutoFill(row: HourlyRow): void {
        const levelCtrl = row.form.get('water_level_m');
        const volumeCtrl = row.form.get('water_volume_mln_m3');
        if (!levelCtrl || !volumeCtrl) return;

        levelCtrl.valueChanges
            .pipe(
                filter(v => typeof v === 'number' && v > 0),
                debounceTime(400),
                distinctUntilChanged(),
                switchMap(level => {
                    const obs = this.levelVolumeService.getVolume(
                        row.config.organization_id,
                        level as number
                    );
                    if (!obs || typeof (obs as any).pipe !== 'function') {
                        return of(null);
                    }
                    return obs.pipe(catchError(() => of(null)));
                }),
                takeUntil(merge(this.destroy$, this.rowsReset$))
            )
            .subscribe(res => {
                if (!res) return;
                if (volumeCtrl.dirty) return;
                volumeCtrl.setValue(res.volume, { emitEvent: false });
                volumeCtrl.markAsDirty();
            });
    }

    private handleHourlyError(
        err: HttpErrorResponse,
        pairs: { row: HourlyRow; payload: ReservoirFloodHourlyPayload }[]
    ): void {
        let detail: string = err.error?.error || err.message || '';
        const idx = err.error?.details?.item_index;
        if (err.status === 400 && typeof idx === 'number' && pairs[idx]) {
            const stationName = pairs[idx].row.config.organization_name ?? '';
            detail = this.translate.instant(
                'SITUATION_CENTER.RESERVOIR_FLOOD.BATCH_FAILED_AT',
                { station: stationName }
            );
            // Defence: if TranslateLoader returned the raw key (e.g. tests with no
            // i18n loaded), append the station name explicitly so error UX still
            // surfaces it.
            if (stationName && !detail.includes(stationName)) {
                detail = `${detail} (${stationName})`;
            }
        } else if (err.status === 403) {
            detail = this.translate.instant(
                'SITUATION_CENTER.RESERVOIR_FLOOD.ERROR_FORBIDDEN_ORG'
            );
        }
        this.messageService.add({
            severity: 'error',
            summary: this.translate.instant('COMMON.ERROR'),
            detail
        });
    }

    private dateYMD(): string {
        return this.formatYMD(this.selectedDate ?? new Date());
    }

    private formatYMD(d: Date): string {
        // Tashkent-aware so that exports / API params reflect the user's
        // calendar date in Asia/Tashkent regardless of browser TZ.
        const { y, m, day } = tashkentDateParts(d);
        return `${String(y)}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }

    private todayMidnight(): Date {
        // "Today Tashkent" — use the calendar date as seen in Asia/Tashkent
        // right now, then materialize Tashkent midnight as a UTC instant. The
        // same instant representation is used by parseDateParam so that the
        // onDateChange same-date guard can compare them via tashkentDateParts.
        const { y, m, day } = tashkentDateParts(new Date());
        return tashkentMidnight(y, m, day);
    }
}
