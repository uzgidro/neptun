import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { Tabs, TabList, Tab, TabPanels, TabPanel } from 'primeng/tabs';
import { Button } from 'primeng/button';
import { Tooltip } from 'primeng/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { DateWidget } from '@/layout/component/widget/date/date.widget';
import { InfraEventService } from '@/core/services/infra-event.service';
import { AuthService } from '@/core/services/auth.service';
import { InfraEventCategory } from '@/core/interfaces/infra-event';
import { EventTableComponent } from './event-table/event-table.component';
import { CategoryAdminComponent } from './category-admin/category-admin.component';

@Component({
    selector: 'app-infra-events',
    standalone: true,
    imports: [
        TranslateModule,
        Tabs, TabList, Tab, TabPanels, TabPanel,
        Button,
        Tooltip,
        DateWidget,
        EventTableComponent,
        CategoryAdminComponent
    ],
    templateUrl: './infra-events.component.html'
})
export class InfraEventsComponent implements OnInit, OnDestroy {
    private infraEventService = inject(InfraEventService);
    authService = inject(AuthService);

    categories: InfraEventCategory[] = [];
    categoriesLoading = false;
    selectedDate: Date = new Date();
    activeTab = '0';
    showCategoryAdmin = false;

    private destroy$ = new Subject<void>();

    ngOnInit(): void {
        this.loadCategories();
    }

    loadCategories(): void {
        this.categoriesLoading = true;
        this.infraEventService
            .getInfraCategories()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (cats) => {
                    this.categories = cats;
                    this.activeTab = '0';
                },
                error: () => (this.categoriesLoading = false),
                complete: () => (this.categoriesLoading = false)
            });
    }

    onDateChanged(date: Date): void {
        this.selectedDate = date;
    }

    onCategoriesChanged(): void {
        this.loadCategories();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
