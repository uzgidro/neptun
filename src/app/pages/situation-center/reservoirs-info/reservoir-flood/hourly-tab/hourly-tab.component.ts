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

const HOURLY_FIELDS = [
    'water_level_m',
    'water_volume_mln_m3',
    'inflow_m3s',
    'outflow_m3s',
    'ges_flow_m3s',
    'filtration_m3s',
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
                        hour: this.selectedHour
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
            queryParams: { hour },
            queryParamsHandling: 'merge'
        });
    }

    onDateChange(date: Date): void {
        if (!(date instanceof Date) || isNaN(date.getTime())) return;
        if (
            this.selectedDate instanceof Date &&
            date.getFullYear() === this.selectedDate.getFullYear() &&
            date.getMonth() === this.selectedDate.getMonth() &&
            date.getDate() === this.selectedDate.getDate()
        ) {
            return;
        }
        const ymd = this.formatYMD(date);
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
        const y = +m[1], mo = +m[2] - 1, d = +m[3];
        const date = new Date(y, mo, d, 0, 0, 0, 0);
        if (isNaN(date.getTime())) return null;
        if (date.getFullYear() !== y || date.getMonth() !== mo || date.getDate() !== d) return null;
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
        const d = new Date(this.selectedDate);
        d.setHours(this.selectedHour, 0, 0, 0);
        return d.toISOString();
    }

    loadData(): void {
        this.rowsReset$.next();
        this.loading = true;
        forkJoin({
            configs: this.svc.getConfigs(),
            records: this.svc.getHourly(this.dateYMD())
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
                    const selectedHourStartUtc = this.toHourStartUTC(this.recordedAt());
                    this.rows = this.configs.map(cfg => {
                        const record =
                            (records || []).find(
                                r =>
                                    r.organization_id === cfg.organization_id &&
                                    this.toHourStartUTC(r.recorded_at) === selectedHourStartUtc
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
            filtration_m3s: [rec?.filtration_m3s ?? null, [Validators.min(0)]],
            idle_discharge_m3s: [rec?.idle_discharge_m3s ?? null, [Validators.min(0)]],
            duty_name: [rec?.duty_name ?? null],
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
        return this.formatYMD(this.selectedDate);
    }

    private formatYMD(d: Date): string {
        const y = d.getFullYear();
        const m = (d.getMonth() + 1).toString().padStart(2, '0');
        const day = d.getDate().toString().padStart(2, '0');
        return `${y}-${m}-${day}`;
    }

    private toHourStartUTC(iso: string): string {
        const d = new Date(iso);
        d.setUTCMinutes(0, 0, 0);
        return d.toISOString();
    }

    private todayMidnight(): Date {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return d;
    }
}
