import { Component } from '@angular/core';
import { ReservoirDeviceComponent } from '@/pages/situation-center/ges/shutdown/reservoir-device/reservoir-device.component';
import { DateWidget } from '@/layout/component/widget/date/date.widget';

@Component({
    selector: 'app-reservoirs-device',
    imports: [ReservoirDeviceComponent, DateWidget],
    templateUrl: './reservoirs-device.component.html',
    styleUrl: './reservoirs-device.component.scss'
})
export class ReservoirsDeviceComponent {
    selectedDate: Date | null = null;

    onDateChanged(date: Date): void {
        this.selectedDate = date;
    }
}
