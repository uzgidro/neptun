import { Component } from '@angular/core';
import { DateWidget } from '@/layout/component/widget/date/date.widget';
import { VisitComponent } from '@/pages/situation-center/ges/shutdown/visit/visit.component';

@Component({
    selector: 'app-visits',
    imports: [DateWidget, VisitComponent],
    templateUrl: './visits.component.html',
    styleUrl: './visits.component.scss'
})
export class VisitsComponent {
    selectedDate: Date | null = null;
}
