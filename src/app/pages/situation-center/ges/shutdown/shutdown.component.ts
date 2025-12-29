import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { TableModule } from 'primeng/table';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { IncidentComponent } from '@/pages/situation-center/ges/shutdown/incident/incident.component';
import { GesShutdownComponent } from '@/pages/situation-center/ges/shutdown/ges-shutdown/ges-shutdown.component';
import { ShutdownDischargeComponent } from '@/pages/situation-center/ges/shutdown/shutdown_discharges/shutdown-discharge.component';
import { ReservoirDeviceComponent } from '@/pages/situation-center/ges/shutdown/reservoir-device/reservoir-device.component';
import { VisitComponent } from '@/pages/situation-center/ges/shutdown/visit/visit.component';
import { OrganizationService } from '@/core/services/organization.service';
import { DateWidget } from '@/layout/component/widget/date/date.widget';

@Component({
    selector: 'app-shutdown',
    imports: [TableModule, ReactiveFormsModule, FormsModule, IncidentComponent, GesShutdownComponent, ShutdownDischargeComponent, ReservoirDeviceComponent, VisitComponent, DateWidget],
    templateUrl: './shutdown.component.html',
    styleUrl: './shutdown.component.scss'
})
export class ShutdownComponent implements OnInit {
    @ViewChild(ShutdownDischargeComponent) shutdownDischargeComponent!: ShutdownDischargeComponent;
    @ViewChild(GesShutdownComponent) gesShutdownComponent!: GesShutdownComponent;

    organizations: any[] = [];
    orgsLoading = false;
    selectedDate: Date | null = null;

    private organizationService: OrganizationService = inject(OrganizationService);
    private messageService: MessageService = inject(MessageService);

    ngOnInit(): void {
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

    onIncidentSaved(): void {
        this.shutdownDischargeComponent?.loadDischarges();
    }

    onShutdownSaved(): void {
        this.shutdownDischargeComponent?.loadDischarges();
    }
}
