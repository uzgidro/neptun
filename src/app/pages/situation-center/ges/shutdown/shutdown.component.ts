import { Component, inject, OnInit } from '@angular/core';
import { TableModule } from 'primeng/table';
import { ReactiveFormsModule } from '@angular/forms';
import { ApiService } from '@/core/services/api.service';
import { MessageService } from 'primeng/api';
import { IncidentComponent } from '@/pages/situation-center/ges/shutdown/incident/incident.component';
import { GesShutdownComponent } from '@/pages/situation-center/ges/shutdown/ges-shutdown/ges-shutdown.component';
import { ShutdownDischargeComponent } from '@/pages/situation-center/ges/shutdown/shutdown_discharges/shutdown-discharge.component';

@Component({
    selector: 'app-shutdown',
    imports: [TableModule, ReactiveFormsModule, IncidentComponent, GesShutdownComponent, ShutdownDischargeComponent],
    templateUrl: './shutdown.component.html',
    styleUrl: './shutdown.component.scss'
})
export class ShutdownComponent implements OnInit {
    organizations: any[] = [];
    orgsLoading = false;
    private api: ApiService = inject(ApiService);
    private messageService: MessageService = inject(MessageService);

    ngOnInit(): void {
        this.orgsLoading = true;
        this.api.getCascades().subscribe({
            next: (data) => {
                this.organizations = data;
            },
            error: (err) => {
                this.messageService.add({ severity: 'error', summary: 'Ошибка', detail: err.message });
            },
            complete: () => (this.orgsLoading = false)
        });
    }
}
