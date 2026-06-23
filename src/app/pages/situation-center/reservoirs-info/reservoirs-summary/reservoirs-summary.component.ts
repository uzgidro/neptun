import { Component, inject, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, registerLocaleData } from '@angular/common';
import { TableModule } from 'primeng/table';
import { InputText } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { ReservoirSummaryService } from '@/core/services/reservoir-summary.service';
import { ReservoirSummaryRequest, ReservoirSummaryResponse } from '@/core/interfaces/reservoir-summary';
import localeRu from '@angular/common/locales/ru';
import { MessageService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from '@/core/services/auth.service';
import { catchError, finalize, forkJoin, of } from 'rxjs';
import { HttpResponse } from '@angular/common/http';
import {
    RESERVOIR_SUMMARY_CONFIG_SOURCE,
    ReservoirSummaryConfigSource
} from '@/core/services/reservoir-summary-config.source';
import { ReservoirSummaryConfig } from '@/core/interfaces/reservoir-summary-config';
import { downloadBlob } from '@/core/utils/download';
import { LevelVolumeService } from '@/core/services/level-volume.service';
import { LevelVolume } from '@/core/interfaces/level-volume';
import { DateWidget } from '@/layout/component/widget/date/date.widget';
import { TooltipModule } from 'primeng/tooltip';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from 'primeng/tabs';
import { TranslateModule } from '@ngx-translate/core';
import { ReservoirSummaryConfigTabComponent } from './config-tab/config-tab.component';

registerLocaleData(localeRu);

@Component({
    selector: 'app-reservoirs-summary',
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        TableModule,
        InputText,
        ButtonModule,
        DateWidget,
        TooltipModule,
        TranslateModule,
        Tabs,
        TabList,
        Tab,
        TabPanels,
        TabPanel,
        ReservoirSummaryConfigTabComponent
    ],
    templateUrl: './reservoirs-summary.component.html',
    styleUrl: './reservoirs-summary.component.scss'
})
export class ReservoirsSummaryComponent implements OnInit {
    private reservoirService: ReservoirSummaryService = inject(ReservoirSummaryService);
    private messageService: MessageService = inject(MessageService);
    private levelVolumeService: LevelVolumeService = inject(LevelVolumeService);
    private translate: TranslateService = inject(TranslateService);
    private configSource = inject<ReservoirSummaryConfigSource>(RESERVOIR_SUMMARY_CONFIG_SOURCE);
    authService: AuthService = inject(AuthService);

    /** Per-organization config (modsnow_enabled, volume_source) loaded alongside the data. */
    private configByOrgId = new Map<number, ReservoirSummaryConfig>();

    selectedDate: Date | null = null;

    data: ReservoirSummaryResponse[] = [];
    originalData: ReservoirSummaryResponse[] = [];
    submitted: boolean = false;

    isExcelLoading = false;
    isPdfLoading = false;

    activeTab: string = 'data';

    onTabChange(key: string | number): void {
        this.activeTab = String(key);
    }

    get dateYMD(): string {
        return this.selectedDate ? `${this.selectedDate.getFullYear()}-${String(this.selectedDate.getMonth() + 1).padStart(2, '0')}-${String(this.selectedDate.getDate()).padStart(2, '0')}` : '';
    }

    ngOnInit() {
        // Data will be loaded via onDateChange when DateWidget initializes
    }

    onDateChange(date: Date): void {
        this.selectedDate = date;
        this.loadData(date);
    }

    private loadData(date: Date) {
        if (date) {
            forkJoin({
                data: this.reservoirService.getReservoirSummary(date),
                configs: this.configSource.getConfigs().pipe(
                    catchError(() => of([] as ReservoirSummaryConfig[]))
                )
            }).subscribe({
                next: ({ data, configs }) => {
                    this.data = data;
                    // Store a deep copy of the original data
                    this.originalData = JSON.parse(JSON.stringify(data));
                    this.configByOrgId = new Map((configs || []).map(c => [c.organization_id, c]));
                },
                error: (error) => {
                    console.error('Error loading reservoir summary:', error);
                }
            });
        }
    }

    /** modsnow editable/visible for this org? Defaults true when no config row. ИТОГО (null) → false. */
    isModsnowEnabled(organizationId: number | null): boolean {
        if (organizationId === null) return false;
        return this.configByOrgId.get(organizationId)?.modsnow_enabled ?? true;
    }

    /** Volume derived from the level curve → manual edits are pointless; show a read-only hint. */
    isVolumeFromLevel(organizationId: number | null): boolean {
        return organizationId !== null
            && this.configByOrgId.get(organizationId)?.volume_source === 'level_volume';
    }

    getPreviousYear(yearsAgo: number): number {
        if (this.selectedDate) {
            return this.selectedDate.getFullYear() - yearsAgo;
        }
        return new Date().getFullYear() - yearsAgo;
    }

    hasChanges(): boolean {
        return JSON.stringify(this.data) !== JSON.stringify(this.originalData);
    }

    onAccept() {
        const dataToSave: ReservoirSummaryRequest[] = this.data
            .filter((value) => value.organization_id !== null)
            .map((reservoir) => {
                const original = this.originalData.find(o => o.organization_id === reservoir.organization_id);
                const request: ReservoirSummaryRequest = {
                    organization_id: reservoir.organization_id!,
                    date: this.dateYMD,
                };

                if (reservoir.income.is_edited) request.income = reservoir.income.current;
                if (reservoir.level.is_edited) request.level = reservoir.level.current;
                if (reservoir.volume.is_edited) request.volume = reservoir.volume.current;
                if (reservoir.release.is_edited) request.release = reservoir.release.current;
                if (reservoir.modsnow.is_edited) {
                    request.modsnow_current = reservoir.modsnow.current;
                    request.modsnow_year_ago = reservoir.modsnow.year_ago;
                }

                if (original && original.incoming_volume !== reservoir.incoming_volume) {
                    request.total_income_volume = reservoir.incoming_volume;
                }

                if (original && original.incoming_volume_prev_year !== reservoir.incoming_volume_prev_year) {
                    request.total_income_volume_prev_year = reservoir.incoming_volume_prev_year;
                }

                return request;
            })
            .filter(r => Object.keys(r).length > 2);

        if (!dataToSave.length) return;

        this.reservoirService.upsetReservoirData(dataToSave).subscribe({
            next: () => {
                this.data.forEach(r => {
                    r.income.is_edited = false;
                    r.level.is_edited = false;
                    r.volume.is_edited = false;
                    r.release.is_edited = false;
                    r.modsnow.is_edited = false;
                });
                this.messageService.add({ severity: 'success', summary: this.translate.instant('RESERVOIRS.MESSAGES.DATA_UPDATED') });
                if (this.selectedDate) {
                    this.loadData(this.selectedDate);
                }
            },
            error: (err) => {
                this.messageService.add({ severity: 'warn', summary: this.translate.instant('RESERVOIRS.MESSAGES.ERROR_OCCURRED'), detail: err });
            }
        });
    }

    onReset() {
        // Restore data from the original copy
        this.data = JSON.parse(JSON.stringify(this.originalData));
    }

    onLevelChange(reservoir: ReservoirSummaryResponse) {
        reservoir.level.is_edited = true;
        if (reservoir.level.current !== null) {
            this.levelVolumeService.getVolume(reservoir.organization_id!, reservoir.level.current).subscribe({
                next: (lv: LevelVolume) => {
                    reservoir.volume.current = lv.volume;
                    reservoir.volume.is_edited = true;
                }
            });
        }
    }

    onVolumeChange(reservoir: ReservoirSummaryResponse) {
        reservoir.volume.is_edited = true;
    }

    onReleaseChange(reservoir: ReservoirSummaryResponse) {
        reservoir.release.is_edited = true;
    }

    onIncomeChange(reservoir: ReservoirSummaryResponse) {
        reservoir.income.is_edited = true;
    }

    onModsnowCurrentChange(reservoir: ReservoirSummaryResponse) {
        reservoir.modsnow.is_edited = true;
    }

    onModsnowYearAgoChange(reservoir: ReservoirSummaryResponse) {
        reservoir.modsnow.is_edited = true;
    }

    onIncomingVolumeChange(reservoir: ReservoirSummaryResponse) {
        reservoir.incoming_volume_is_calculated = false;
        reservoir.incoming_volume_is_reset = false;
    }

    onIncomingVolumePrevYearChange(reservoir: ReservoirSummaryResponse) {
        reservoir.incoming_volume_prev_year_is_calculated = false;
        reservoir.incoming_volume_prev_year_is_reset = false;
    }

    onResetIncomingVolume(reservoir: ReservoirSummaryResponse) {
        reservoir.incoming_volume = null;
        reservoir.incoming_volume_is_reset = true;
        reservoir.incoming_volume_is_calculated = false;
    }

    onResetIncomingVolumePrevYear(reservoir: ReservoirSummaryResponse) {
        reservoir.incoming_volume_prev_year = null;
        reservoir.incoming_volume_prev_year_is_reset = true;
        reservoir.incoming_volume_prev_year_is_calculated = false;
    }

    getIncomingVolumeTooltip(reservoir: ReservoirSummaryResponse): string {
        if (reservoir.incoming_volume_base_date || reservoir.incoming_volume_base_value != null) {
            return `Базовая дата: ${reservoir.incoming_volume_base_date || '-'}\nБазовое значение: ${reservoir.incoming_volume_base_value != null ? reservoir.incoming_volume_base_value : '-'}`;
        }
        return '';
    }

    getIncomingVolumePrevYearTooltip(reservoir: ReservoirSummaryResponse): string {
        if (reservoir.incoming_volume_prev_year_base_date || reservoir.incoming_volume_prev_year_base_value != null) {
            return `Базовая дата: ${reservoir.incoming_volume_prev_year_base_date || '-'}\nБазовое значение: ${reservoir.incoming_volume_prev_year_base_value != null ? reservoir.incoming_volume_prev_year_base_value : '-'}`;
        }
        return '';
    }

    onInputFocus(event: FocusEvent, obj: any, field: string) {
        // Clear the input if the value is 0
        if (obj[field] === 0) {
            obj[field] = null;
            // Update the input value to empty
            setTimeout(() => {
                const input = event.target as HTMLInputElement;
                if (input) {
                    input.value = '';
                }
            }, 0);
        }
    }

    download(format: 'excel' | 'pdf') {
        // Устанавливаем статус загрузки
        if (format === 'excel') this.isExcelLoading = true;
        else this.isPdfLoading = true;

        this.reservoirService
            .downloadSummary(this.selectedDate!, format)
            .pipe(
                finalize(() => {
                    // Снимаем спиннер в любом случае (успех или ошибка)
                    this.isExcelLoading = false;
                    this.isPdfLoading = false;
                })
            )
            .subscribe({
                next: (response: HttpResponse<Blob>) => {
                    // 1. Пытаемся достать имя файла из заголовка Content-Disposition
                    const extension = format === 'excel' ? 'xlsx' : 'pdf';
                    const filename = `СВОД_${this.dateYMD}.${extension}`;

                    downloadBlob(response.body!, filename);
                },
                error: (err: any) => {
                    console.error('Ошибка при скачивании:', err);
                    alert('Не удалось скачать файл. Проверьте консоль.');
                }
            });
    }
}
