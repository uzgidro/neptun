import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Dialog } from 'primeng/dialog';
import { Button } from 'primeng/button';

@Component({
    selector: 'app-approve-confirmation',
    imports: [Dialog, Button],
    templateUrl: './approve-confirmation.component.html',
    styleUrl: './approve-confirmation.component.scss'
})
export class ApproveConfirmationComponent {
    @Input() visible: boolean = false;
    @Input() message: string = 'Вы уверены, что хотите подтвердить?';

    @Output() visibleChange = new EventEmitter<boolean>();
    @Output() onConfirm = new EventEmitter<void>();

    closeDialog(): void {
        this.visible = false;
        this.visibleChange.emit(this.visible);
    }

    confirm(): void {
        this.onConfirm.emit();
        this.closeDialog();
    }
}
