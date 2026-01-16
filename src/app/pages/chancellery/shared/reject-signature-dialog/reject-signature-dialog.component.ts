import { Component, EventEmitter, inject, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Dialog } from 'primeng/dialog';
import { Textarea } from 'primeng/textarea';
import { ButtonDirective, ButtonLabel } from 'primeng/button';
import { RejectSignatureRequest } from '@/core/interfaces/chancellery/signature';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-reject-signature-dialog',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        Dialog,
        Textarea,
        ButtonDirective,
        ButtonLabel,
        TranslateModule
    ],
    template: `
        <p-dialog
            [header]="'CHANCELLERY.SIGNATURE.REJECT_TITLE' | translate"
            [(visible)]="visible"
            [modal]="true"
            [style]="{ width: '450px' }"
            [dismissableMask]="true"
            (onHide)="onCancel()">

            <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {{ 'CHANCELLERY.SIGNATURE.REJECT_DESCRIPTION' | translate }}
            </p>

            @if (documentName) {
                <div class="mb-4 p-3 bg-surface-100 dark:bg-surface-800 rounded-lg">
                    <span class="font-medium">{{ documentName }}</span>
                </div>
            }

            <form [formGroup]="form" class="flex flex-col gap-4">
                <!-- Rejection Reason -->
                <div class="flex flex-col gap-2">
                    <label class="font-medium text-sm" for="reason">
                        {{ 'CHANCELLERY.SIGNATURE.REJECTION_REASON' | translate }}
                    </label>
                    <textarea
                        pTextarea
                        id="reason"
                        formControlName="reason"
                        rows="4"
                        [placeholder]="'CHANCELLERY.SIGNATURE.REJECTION_REASON_PLACEHOLDER' | translate"
                        class="w-full">
                    </textarea>
                </div>
            </form>

            <ng-template #footer>
                <div class="flex justify-end gap-2">
                    <button pButton type="button" severity="secondary" [disabled]="saving" (click)="onCancel()">
                        <span pButtonLabel>{{ 'COMMON.CANCEL' | translate }}</span>
                    </button>
                    <button pButton type="button" severity="danger" [loading]="saving" (click)="onSubmit()">
                        <span pButtonLabel>{{ 'CHANCELLERY.SIGNATURE.REJECT' | translate }}</span>
                    </button>
                </div>
            </ng-template>
        </p-dialog>
    `
})
export class RejectSignatureDialogComponent implements OnChanges {
    @Input() visible = false;
    @Input() documentName = '';
    @Input() saving = false;

    @Output() visibleChange = new EventEmitter<boolean>();
    @Output() cancel = new EventEmitter<void>();
    @Output() confirm = new EventEmitter<RejectSignatureRequest>();

    private fb = inject(FormBuilder);

    form: FormGroup;

    constructor() {
        this.form = this.fb.group({
            reason: ['']
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

        const request: RejectSignatureRequest = {};

        if (formValue.reason) {
            request.reason = formValue.reason;
        }

        this.confirm.emit(request);
    }
}
