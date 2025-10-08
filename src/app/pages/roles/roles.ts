import { Component, inject, OnInit } from '@angular/core';
import { TableModule } from 'primeng/table';
import { ApiService } from '@/core/services/api.service';
import { Roles } from '@/core/interfaces/roles';

@Component({
    selector: 'app-roles',
    imports: [TableModule],
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
}
