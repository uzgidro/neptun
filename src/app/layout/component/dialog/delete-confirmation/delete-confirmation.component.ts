import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Dialog } from 'primeng/dialog';
import { Button } from 'primeng/button';

@Component({
    selector: 'app-delete-confirmation',
    imports: [Dialog, Button],
    templateUrl: './delete-confirmation.component.html',
    styleUrl: './delete-confirmation.component.scss'
})
export class DeleteConfirmationComponent {
    @Input() visible: boolean = false;
    @Input() message: string = 'Вы уверены, что хотите удалить этот элемент?';

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
