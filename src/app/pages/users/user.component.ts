import { Component, inject, OnInit } from '@angular/core';
import { TableModule } from 'primeng/table';
import { Users } from '@/core/interfaces/users';
import { ApiService } from '@/core/services/api.service';

@Component({
    selector: 'app-users',
    imports: [TableModule],
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
}
