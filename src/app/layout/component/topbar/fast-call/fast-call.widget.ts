import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { Popover } from 'primeng/popover';
import { TableModule } from 'primeng/table';
import { ButtonDirective } from 'primeng/button';
import { Avatar } from 'primeng/avatar';
import { FastCallService } from '@/core/services/fast-call.service';
import { FastCall } from '@/core/interfaces/fast-call';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-fast-call',
    imports: [Popover, TableModule, ButtonDirective, Avatar, TranslateModule],
    templateUrl: './fast-call.widget.html',
    styleUrl: './fast-call.widget.scss'
})
export class FastCallWidget implements OnInit, OnDestroy {
    contacts: FastCall[] = [];

    private fastCallsService: FastCallService = inject(FastCallService);
    private destroy$ = new Subject<void>();

    ngOnInit() {
        this.fastCallsService.getFastCalls().pipe(takeUntil(this.destroy$)).subscribe({
            next: (data) => {
                this.contacts = data;
            }
        });
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
