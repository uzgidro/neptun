import { Component, inject, OnInit } from '@angular/core';
import { Table, TableModule } from 'primeng/table';
import { Users } from '@/core/interfaces/users';
import { ApiService } from '@/core/services/api.service';
import { ButtonDirective, ButtonIcon, ButtonLabel } from 'primeng/button';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';

@Component({
    selector: 'app-users',
    imports: [TableModule, ButtonDirective, IconField, InputIcon, InputText, ButtonLabel, ButtonIcon],
    templateUrl: './user.component.html',
    styleUrl: './user.component.scss'
})
export class User implements OnInit {
    users: Users[] = [];

    private apiService = inject(ApiService);

    loading: boolean = true;

    ngOnInit() {
        this.apiService.getUsers().subscribe({
            next: (data) => {
                this.users = data;
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
