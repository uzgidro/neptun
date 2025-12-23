import { Component } from '@angular/core';
import { DateWidget } from '@/layout/component/widget/date/date.widget';
import { IncidentComponent } from '@/pages/situation-center/ges/shutdown/incident/incident.component';

@Component({
    selector: 'app-incidents',
    imports: [DateWidget, IncidentComponent],
    templateUrl: './incidents.component.html',
    styleUrl: './incidents.component.scss'
})
export class IncidentsComponent {
    selectedDate: Date | null = null;
}
