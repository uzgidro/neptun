import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { TableModule } from 'primeng/table';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { IncidentComponent } from '@/pages/situation-center/ges/shutdown/incident/incident.component';
import { GesShutdownComponent } from '@/pages/situation-center/ges/shutdown/ges-shutdown/ges-shutdown.component';
import { ShutdownDischargeComponent } from '@/pages/situation-center/ges/shutdown/shutdown_discharges/shutdown-discharge.component';
import { DatePicker } from 'primeng/datepicker';
import { ReservoirDeviceComponent } from '@/pages/situation-center/ges/shutdown/reservoir-device/reservoir-device.component';
import { VisitComponent } from '@/pages/situation-center/ges/shutdown/visit/visit.component';
import { OrganizationService } from '@/core/services/organization.service';

@Component({
    selector: 'app-shutdown',
    imports: [TableModule, ReactiveFormsModule, FormsModule, IncidentComponent, GesShutdownComponent, ShutdownDischargeComponent, DatePicker, ReservoirDeviceComponent, VisitComponent],
    templateUrl: './shutdown.component.html',
    styleUrl: './shutdown.component.scss'
})
export class ShutdownComponent implements OnInit {
    @ViewChild(ShutdownDischargeComponent) shutdownDischargeComponent!: ShutdownDischargeComponent;

    organizations: any[] = [];
    orgsLoading = false;
    selectedDate: Date | null = null;

    private organizationService: OrganizationService = inject(OrganizationService);
    private messageService: MessageService = inject(MessageService);
    private router: Router = inject(Router);
    private route: ActivatedRoute = inject(ActivatedRoute);

    ngOnInit(): void {
        // Initialize date from queryParams or default to today
        this.route.queryParams.subscribe((params) => {
            if (params['date']) {
                this.selectedDate = new Date(params['date']);
            } else {
                this.selectedDate = new Date();
                this.updateQueryParams();
            }
        });

        this.orgsLoading = true;
        this.organizationService.getCascades().subscribe({
            next: (data) => {
                this.organizations = data;
            },
            error: (err) => {
                this.messageService.add({ severity: 'error', summary: 'Ошибка', detail: err.message });
            },
            complete: () => (this.orgsLoading = false)
        });
    }

    onDateChange(): void {
        this.updateQueryParams();
    }

    private updateQueryParams(): void {
        if (this.selectedDate) {
            this.router.navigate([], {
                relativeTo: this.route,
                queryParams: { date: this.selectedDate.toISOString() },
                queryParamsHandling: 'merge'
            });
        }
    }

    onIncidentSaved(): void {
        this.shutdownDischargeComponent?.loadDischarges();
    }
}
