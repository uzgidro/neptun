import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { ReservoirSummaryService } from '@/core/services/reservoir-summary.service';
import { ReservoirSummaryRequest, ReservoirSummaryResponse } from '@/core/interfaces/reservoir-summary';
import { TimeService } from '@/core/services/time.service';
import { InputNumberdComponent } from '@/layout/component/dialog/input-number/input-number.component';
import { DatePickerComponent } from '@/layout/component/dialog/date-picker/date-picker.component';

interface DutyCard {
    organization_id: number;
    organization_name: string;
    form: FormGroup;
    saving: boolean;
}

@Component({
    selector: 'app-reservoir-duty-entry',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        CardModule,
        ButtonModule,
        TranslateModule,
        InputNumberdComponent,
        DatePickerComponent
    ],
    templateUrl: './reservoir-duty-entry.component.html'
})
export class ReservoirDutyEntryComponent implements OnInit, OnDestroy {
    private destroy$ = new Subject<void>();
    private svc = inject(ReservoirSummaryService);
    private messageService = inject(MessageService);
    private translate = inject(TranslateService);
    private timeService = inject(TimeService);
    private fb = inject(FormBuilder);

    selectedDate: Date = new Date();
    readonly maxDate: Date = new Date();
    cards: DutyCard[] = [];
    loading = false;
    hasNoOrganization = false;

    ngOnInit(): void {
        this.loadData(this.selectedDate);
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    onDateChange(date: Date): void {
        this.selectedDate = date;
        this.loadData(date);
    }

    private loadData(date: Date): void {
        this.loading = true;
        this.cards = [];
        this.hasNoOrganization = false;
        this.svc.getReservoirSummary(date)
            .pipe(takeUntil(this.destroy$), finalize(() => this.loading = false))
            .subscribe({
                next: (rows) => {
                    // `reservoir` role receives only its own organizations and no TOTAL row,
                    // but guard against a null organization_id just in case.
                    const own = (rows || []).filter(r => r.organization_id !== null);
                    this.cards = own.map(r => this.toCard(r));
                    this.hasNoOrganization = this.cards.length === 0;
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

    private toCard(r: ReservoirSummaryResponse): DutyCard {
        return {
            organization_id: r.organization_id!,
            organization_name: r.organization_name ?? '',
            saving: false,
            form: this.fb.group({
                level: [r.level?.current ?? null],
                income: [r.income?.current ?? null],
                release: [r.release?.current ?? null],
                modsnow_current: [r.modsnow?.current ?? null]
            })
        };
    }

    saveCard(card: DutyCard): void {
        const v = card.form.value;
        const payload: ReservoirSummaryRequest = {
            organization_id: card.organization_id,
            date: this.timeService.dateToYMD(this.selectedDate)
        };
        if (v.level !== null && v.level !== undefined) payload.level = v.level;
        if (v.income !== null && v.income !== undefined) payload.income = v.income;
        if (v.release !== null && v.release !== undefined) payload.release = v.release;
        if (v.modsnow_current !== null && v.modsnow_current !== undefined) {
            payload.modsnow_current = v.modsnow_current;
        }

        card.saving = true;
        this.svc.upsetReservoirData([payload])
            .pipe(takeUntil(this.destroy$), finalize(() => card.saving = false))
            .subscribe({
                next: () => {
                    this.messageService.add({
                        severity: 'success',
                        summary: this.translate.instant('COMMON.SUCCESS'),
                        detail: this.translate.instant('SITUATION_CENTER.RESERVOIR_DUTY.SAVED')
                    });
                },
                error: (err: HttpErrorResponse) => {
                    const detail = err?.status === 403
                        ? this.translate.instant('SITUATION_CENTER.RESERVOIR_DUTY.ACCESS_DENIED')
                        : this.translate.instant('SITUATION_CENTER.RESERVOIR_DUTY.SAVE_FAILED');
                    this.messageService.add({
                        severity: 'error',
                        summary: this.translate.instant('COMMON.ERROR'),
                        detail
                    });
                }
            });
    }
}
