import { Component, inject, OnInit } from '@angular/core';
import { Popover } from 'primeng/popover';
import { TableModule } from 'primeng/table';
import { ButtonDirective } from 'primeng/button';
import { Avatar } from 'primeng/avatar';
import { FastCallService } from '@/core/services/fast-call.service';
import { FastCall } from '@/core/interfaces/fast-call';

@Component({
    selector: 'app-fast-call',
    imports: [Popover, TableModule, ButtonDirective, Avatar],
    templateUrl: './fast-call.widget.html',
    styleUrl: './fast-call.widget.scss'
})
export class FastCallWidget implements OnInit {
    contacts: FastCall[] = [];

    private fastCallsService: FastCallService = inject(FastCallService);

    ngOnInit() {
        this.fastCallsService.getFastCalls().subscribe({
            next: (data) => {
                this.contacts = data;
            }
        });
    }
}
