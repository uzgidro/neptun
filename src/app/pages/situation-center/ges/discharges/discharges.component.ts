import { Component } from '@angular/core';
import { ShutdownDischargeComponent } from '@/pages/situation-center/ges/shutdown/shutdown_discharges/shutdown-discharge.component';
import { DateWidget } from '@/layout/component/widget/date/date.widget';

@Component({
    selector: 'app-discharges',
    imports: [ShutdownDischargeComponent, DateWidget],
    templateUrl: './discharges.component.html',
    styleUrl: './discharges.component.scss'
})
export class DischargesComponent {
    selectedDate: Date | null = null;

    onDateChange(date: Date): void {
        this.selectedDate = date;
    }
}
