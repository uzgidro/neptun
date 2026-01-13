import { Component } from '@angular/core';
import { ShutdownDischargeComponent } from '@/pages/situation-center/ges/shutdown/shutdown_discharges/shutdown-discharge.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-discharges',
    imports: [ShutdownDischargeComponent, TranslateModule],
    templateUrl: './discharges.component.html',
    styleUrl: './discharges.component.scss'
})
export class DischargesComponent {
    selectedDate: Date | null = null;

    onDateChange(date: Date): void {
        this.selectedDate = date;
    }
}
