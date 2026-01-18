import { Component } from '@angular/core';
import { ScHeaderComponent } from './widgets/sc-header/sc-header.component';
import { ScMonitoringComponent } from './widgets/sc-monitoring/sc-monitoring.component';
import { ScPowerGenerationComponent } from './widgets/sc-power-generation/sc-power-generation.component';
import { ScStationStatusComponent } from './widgets/sc-station-status/sc-station-status.component';
import { ScShutdownsComponent } from './widgets/sc-shutdowns/sc-shutdowns.component';
import { ScDischargesComponent } from './widgets/sc-discharges/sc-discharges.component';
import { ScMapComponent } from './widgets/sc-map/sc-map.component';

@Component({
    selector: 'app-sc-dashboard',
    standalone: true,
    imports: [
        ScHeaderComponent,
        ScMonitoringComponent,
        ScPowerGenerationComponent,
        ScStationStatusComponent,
        ScShutdownsComponent,
        ScDischargesComponent,
        ScMapComponent
    ],
    templateUrl: './sc-dashboard.component.html',
    styleUrl: './sc-dashboard.component.scss'
})
export class ScDashboardComponent {}
