import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Dialog } from 'primeng/dialog';
import { PrimeTemplate } from 'primeng/api';
import { Button } from 'primeng/button';

@Component({
    selector: 'app-dialog',
    imports: [Dialog, PrimeTemplate, Button, ReactiveFormsModule],
    templateUrl: './dialog.component.html',
    styleUrl: './dialog.component.scss'
})
export class DialogComponent {
    // --- Входящие ---
    @Input() visible: boolean = false;
    @Input({ required: true }) header: string = '';
    @Input() form: FormGroup = new FormGroup({});
    @Input() submitting: boolean = false;
    @Input() saveLabel: string = 'Сохранить';
    @Input() width: string = '30vw';
    @Input() showFooter: boolean = true;
    @Input() showConvertButton: boolean = false;
    @Input() convertLabel: string = 'Конвертировать в USD';

    // --- Исходящие ---
    @Output() visibleChange = new EventEmitter<boolean>();
    @Output() save = new EventEmitter<void>();
    @Output() cancel = new EventEmitter<void>();
    @Output() convert = new EventEmitter<void>();

    // Клик по "Сохранить"
    onSaveClick() {
        this.save.emit();
    }

    // Клик по "Отмена" или (onHide)
    onCancelClick() {
        this.visible = false;
        this.visibleChange.emit(false);
        this.cancel.emit();
    }

    // Клик по "Конвертировать"
    onConvertClick() {
        this.convert.emit();
    }
}
