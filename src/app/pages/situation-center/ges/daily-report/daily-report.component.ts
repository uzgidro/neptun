import { Component, ViewChild } from '@angular/core';
import { Tabs, TabList, Tab, TabPanels, TabPanel } from 'primeng/tabs';
import { TranslateModule } from '@ngx-translate/core';
import { ConfigTabComponent } from './config-tab/config-tab.component';
import { DataEntryTabComponent } from './data-entry-tab/data-entry-tab.component';
import { PlansTabComponent } from './plans-tab/plans-tab.component';
import { ReportTabComponent } from './report-tab/report-tab.component';
import { HasUnsavedChanges } from '@/core/guards/auth.guard';

@Component({
    selector: 'app-ges-daily-report',
    standalone: true,
    imports: [
        TranslateModule,
        Tabs, TabList, Tab, TabPanels, TabPanel,
        ConfigTabComponent,
        DataEntryTabComponent,
        PlansTabComponent,
        ReportTabComponent
    ],
    templateUrl: './daily-report.component.html'
})
export class DailyReportComponent implements HasUnsavedChanges {
    @ViewChild(DataEntryTabComponent) dataEntryTab?: DataEntryTabComponent;

    canDeactivate(): boolean {
        return this.dataEntryTab ? this.dataEntryTab.canDeactivate() : true;
    }
}
