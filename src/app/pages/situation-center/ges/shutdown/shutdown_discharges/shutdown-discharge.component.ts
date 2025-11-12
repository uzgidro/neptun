import { Component, inject, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { MessageService, PrimeTemplate } from 'primeng/api';
import { ReactiveFormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { DischargeService } from '@/core/services/discharge.service';
import { IdleDischargeResponse } from '@/core/interfaces/discharge';

@Component({
    selector: 'app-shutdown-discharge',
    imports: [DatePipe, PrimeTemplate, ReactiveFormsModule, TableModule, DecimalPipe],
    templateUrl: './shutdown-discharge.component.html',
    styleUrl: './shutdown-discharge.component.scss'
})
export class ShutdownDischargeComponent implements OnInit, OnChanges {
    @Input() date: Date | null = null;

    discharges: IdleDischargeResponse[] = [];
    loading: boolean = false;
    private dischargeService: DischargeService = inject(DischargeService);
    private messageService: MessageService = inject(MessageService);

    ngOnInit(): void {
        this.loadDischarges();
    }

    private loadDischarges() {
        this.loading = true;
        const dateToUse = this.date || new Date();
        this.dischargeService.getFlatDischarges(dateToUse).subscribe({
            next: (data) => {
                this.discharges = data;
            },
            error: (err) => {
                this.messageService.add({ severity: 'error', summary: 'Ошибка', detail: err.message });
            },
            complete: () => (this.loading = false)
        });
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['date'] && !changes['date'].firstChange) {
            this.loadDischarges();
        }
    }
}
