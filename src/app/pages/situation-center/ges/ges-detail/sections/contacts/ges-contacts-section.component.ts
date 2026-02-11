import { Component, inject, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonDirective, ButtonIcon } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { TooltipModule } from 'primeng/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';

import { GesService } from '@/core/services/ges.service';
import { GesContact } from '@/core/interfaces/ges';

@Component({
    selector: 'app-ges-contacts-section',
    standalone: true,
    imports: [CommonModule, FormsModule, TableModule, ButtonDirective, ButtonIcon, InputText, IconField, InputIcon, TooltipModule, TranslateModule],
    templateUrl: './ges-contacts-section.component.html',
    styleUrl: './ges-contacts-section.component.scss'
})
export class GesContactsSectionComponent implements OnInit {
    @Input() gesId!: number;

    private gesService = inject(GesService);
    private messageService = inject(MessageService);

    contacts: GesContact[] = [];
    loading = false;
    searchValue = '';

    ngOnInit(): void {
        this.loadContacts();
    }

    loadContacts(): void {
        this.loading = true;
        this.gesService.getContacts(this.gesId).subscribe({
            next: (data) => {
                this.contacts = this.sortContacts(data);
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

    private sortContacts(contacts: GesContact[]): GesContact[] {
        if (!contacts) return [];
        return [...contacts].sort((a, b) => {
            const posA = a.position?.description?.toLowerCase() || '';
            const posB = b.position?.description?.toLowerCase() || '';
            if (posA.includes('директор')) return -1;
            if (posB.includes('директор')) return 1;
            return 0;
        });
    }

    clear(table: any): void {
        table.clear();
        this.searchValue = '';
    }
}
