import { Component, inject, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { TranslateModule } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';

import { GesService } from '@/core/services/ges.service';
import { GesResponse } from '@/core/interfaces/ges';
import { Department } from '@/core/interfaces/department';

@Component({
    selector: 'app-ges-info-section',
    standalone: true,
    imports: [CommonModule, TableModule, TranslateModule],
    templateUrl: './ges-info-section.component.html',
    styleUrl: './ges-info-section.component.scss'
})
export class GesInfoSectionComponent implements OnInit {
    @Input() gesId!: number;
    @Input() gesInfo!: GesResponse;

    private gesService = inject(GesService);
    private messageService = inject(MessageService);

    departments: Department[] = [];
    loading = false;

    ngOnInit(): void {
        this.loadDepartments();
    }

    loadDepartments(): void {
        this.loading = true;
        this.gesService.getDepartments(this.gesId).subscribe({
            next: (data) => {
                this.departments = data;
            },
            error: (err) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'GES_DETAIL.ERROR_LOADING',
                    detail: err.message
                });
                this.loading = false;
            },
            complete: () => {
                this.loading = false;
            }
        });
    }
}
