import { Component, inject, OnInit } from '@angular/core';
import { Table, TableModule } from 'primeng/table';
import { ApiService } from '@/core/services/api.service';
import { Roles } from '@/core/interfaces/roles';
import { ButtonDirective, ButtonIcon, ButtonLabel } from 'primeng/button';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';

@Component({
    selector: 'app-roles',
    imports: [TableModule, ButtonDirective, ButtonIcon, ButtonLabel, IconField, InputIcon, InputText],
    templateUrl: './roles.html',
    styleUrl: './roles.scss'
})
export class Role implements OnInit {
    roles: Roles[] = [];
    loading = false;

    private apiService = inject(ApiService);

    ngOnInit() {
        this.loading = true;
        this.apiService.getRoles().subscribe({
            next: (data) => {
                this.roles = data;
            },
            error: (err) => {
                console.log(err);
            },
            complete: () => {
                this.loading = false;
            }
        });
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }
}
