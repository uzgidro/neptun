import { Component, EventEmitter, inject, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Dialog } from 'primeng/dialog';
import { Select } from 'primeng/select';
import { Textarea } from 'primeng/textarea';
import { ButtonDirective, ButtonLabel } from 'primeng/button';
import { SignDocumentRequest } from '@/core/interfaces/chancellery/signature';
import { Contact } from '@/core/interfaces/contact';
import { TranslateModule } from '@ngx-translate/core';
import { DatePickerComponent } from '@/layout/component/dialog/date-picker/date-picker.component';

@Component({
    selector: 'app-sign-document-dialog',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        Dialog,
        Select,
        Textarea,
        ButtonDirective,
        ButtonLabel,
        DatePickerComponent,
        TranslateModule
    ],
    template: `
        <p-dialog
            [header]="'CHANCELLERY.SIGNATURE.SIGN_TITLE' | translate"
            [(visible)]="visible"
            [modal]="true"
            [style]="{ width: '500px' }"
            [dismissableMask]="true"
            (onHide)="onCancel()">

            <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {{ 'CHANCELLERY.SIGNATURE.SIGN_DESCRIPTION' | translate }}
            </p>

            @if (documentName) {
                <div class="mb-4 p-3 bg-surface-100 dark:bg-surface-800 rounded-lg">
                    <span class="font-medium">{{ documentName }}</span>
                </div>
            }

            <form [formGroup]="form" class="flex flex-col gap-4">
                <!-- Resolution Text -->
                <div class="flex flex-col gap-2">
                    <label class="font-medium text-sm" for="resolution">
                        {{ 'CHANCELLERY.SIGNATURE.RESOLUTION' | translate }}
                    </label>
                    <textarea
                        pTextarea
                        id="resolution"
                        formControlName="resolution_text"
                        rows="3"
                        [placeholder]="'CHANCELLERY.SIGNATURE.RESOLUTION_PLACEHOLDER' | translate"
                        class="w-full">
                    </textarea>
                </div>

                <!-- Assigned Executor -->
                <div class="flex flex-col gap-2">
                    <label class="font-medium text-sm" for="executor">
                        {{ 'CHANCELLERY.SIGNATURE.ASSIGNED_EXECUTOR' | translate }}
                    </label>
                    <p-select
                        id="executor"
                        formControlName="assigned_executor_id"
                        [options]="contacts"
                        optionLabel="name"
                        optionValue="id"
                        [placeholder]="'CHANCELLERY.SIGNATURE.SELECT_EXECUTOR' | translate"
                        [style]="{ width: '100%' }"
                        [showClear]="true"
                        [filter]="true"
                        filterBy="name">
                    </p-select>
                </div>

                <!-- Assigned Due Date -->
                <app-date-picker
                    formControlName="assigned_due_date"
                    [label]="'CHANCELLERY.SIGNATURE.ASSIGNED_DUE_DATE' | translate"
                    [required]="false"
                    [showTime]="false"
                    [maxDate]="maxDueDate">
                </app-date-picker>
            </form>

            <ng-template #footer>
                <div class="flex justify-end gap-2">
                    <button pButton type="button" severity="secondary" [disabled]="saving" (click)="onCancel()">
                        <span pButtonLabel>{{ 'COMMON.CANCEL' | translate }}</span>
                    </button>
                    <button pButton type="button" [loading]="saving" (click)="onSubmit()">
                        <span pButtonLabel>{{ 'CHANCELLERY.SIGNATURE.SIGN' | translate }}</span>
                    </button>
                </div>
            </ng-template>
        </p-dialog>
    `
})
export class SignDocumentDialogComponent implements OnChanges {
    @Input() visible = false;
    @Input() documentName = '';
    @Input() contacts: Contact[] = [];
    @Input() saving = false;

    @Output() visibleChange = new EventEmitter<boolean>();
    @Output() cancel = new EventEmitter<void>();
    @Output() confirm = new EventEmitter<SignDocumentRequest>();

    private fb = inject(FormBuilder);

    // Allow selecting due dates up to 5 years in the future
    maxDueDate = new Date(new Date().getFullYear() + 5, 11, 31);

    form: FormGroup;

    constructor() {
        this.form = this.fb.group({
            resolution_text: [''],
            assigned_executor_id: [null],
            assigned_due_date: [null]
        });
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['visible'] && this.visible) {
            this.resetForm();
        }
    }

    resetForm(): void {
        this.form.reset();
    }

    onCancel(): void {
        this.visible = false;
        this.visibleChange.emit(false);
        this.cancel.emit();
    }

    onSubmit(): void {
        const formValue = this.form.value;

        const request: SignDocumentRequest = {};

        if (formValue.resolution_text) {
            request.resolution_text = formValue.resolution_text;
        }

        if (formValue.assigned_executor_id) {
            request.assigned_executor_id = formValue.assigned_executor_id;
        }

        if (formValue.assigned_due_date) {
            request.assigned_due_date = this.formatDate(formValue.assigned_due_date);
        }

        this.confirm.emit(request);
    }

    private formatDate(date: Date): string {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
}
