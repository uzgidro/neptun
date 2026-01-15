import { Component, EventEmitter, inject, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Dialog } from 'primeng/dialog';
import { Select } from 'primeng/select';
import { Textarea } from 'primeng/textarea';
import { ButtonDirective, ButtonLabel } from 'primeng/button';
import { Tag } from 'primeng/tag';
import { ChangeStatusRequest, DocumentStatus } from '@/core/interfaces/chancellery/document-status';
import { DocumentStatusService } from '@/core/services/chancellery/document-status.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-status-change-dialog',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule, Dialog, Select, Textarea, ButtonDirective, Tag, TranslateModule, ButtonLabel],
    template: `
        <p-dialog [header]="'CHANCELLERY.STATUS_CHANGE.TITLE' | translate" [(visible)]="visible" [modal]="true" [style]="{ width: '450px' }" [dismissableMask]="true" (onHide)="onCancel()">
            <form [formGroup]="form" class="flex flex-col gap-4">
                <!-- Current Status -->
                <div class="flex flex-col gap-2">
                    <label class="font-medium text-sm">
                        {{ 'CHANCELLERY.STATUS_CHANGE.CURRENT_STATUS' | translate }}
                    </label>
                    @if (currentStatus) {
                        <p-tag [value]="currentStatus.name" [severity]="statusService.getStatusSeverity(currentStatus.code)" [rounded]="true" />
                    }
                </div>

                <!-- New Status -->
                <div class="flex flex-col gap-2">
                    <label class="font-medium text-sm" for="newStatus"> {{ 'CHANCELLERY.STATUS_CHANGE.NEW_STATUS' | translate }} * </label>
                    <p-select
                        id="newStatus"
                        formControlName="status_id"
                        [options]="availableStatuses"
                        optionLabel="name"
                        optionValue="id"
                        [placeholder]="'CHANCELLERY.STATUS_CHANGE.SELECT_STATUS' | translate"
                        [style]="{ width: '100%' }"
                        [showClear]="false"
                    >
                        <ng-template #item let-status>
                            <div class="flex items-center gap-2">
                                <p-tag [value]="status.name" [severity]="statusService.getStatusSeverity(status.code)" [rounded]="true" size="small" />
                            </div>
                        </ng-template>
                    </p-select>
                    @if (submitted && form.get('status_id')?.errors?.['required']) {
                        <small class="text-red-500">
                            {{ 'CHANCELLERY.STATUS_CHANGE.STATUS_REQUIRED' | translate }}
                        </small>
                    }
                </div>

                <!-- Comment -->
                <div class="flex flex-col gap-2">
                    <label class="font-medium text-sm" for="comment">
                        {{ 'CHANCELLERY.STATUS_CHANGE.COMMENT' | translate }}
                    </label>
                    <textarea pTextarea id="comment" formControlName="comment" rows="3" [placeholder]="'CHANCELLERY.STATUS_CHANGE.COMMENT_PLACEHOLDER' | translate" class="w-full"> </textarea>
                </div>
            </form>

            <ng-template #footer>
                <div class="flex justify-end gap-2">
                    <button pButton type="button" severity="secondary" [disabled]="saving" (click)="onCancel()">
                        <span pButtonLabel>{{ 'COMMON.CANCEL' | translate }}</span>
                    </button>
                    <button pButton type="button" [loading]="saving" (click)="onSubmit()">
                        <span pButtonLabel>{{'CHANCELLERY.STATUS_CHANGE.CHANGE' | translate}}</span>
                    </button>
                </div>
            </ng-template>
        </p-dialog>
    `
})
export class StatusChangeDialogComponent implements OnChanges {
    @Input() visible = false;
    @Input() currentStatus: DocumentStatus | null = null;
    @Input() availableStatuses: DocumentStatus[] = [];
    @Input() saving = false;

    @Output() visibleChange = new EventEmitter<boolean>();
    @Output() cancel = new EventEmitter<void>();
    @Output() confirm = new EventEmitter<ChangeStatusRequest>();

    statusService = inject(DocumentStatusService);
    private fb = inject(FormBuilder);

    form: FormGroup;
    submitted = false;

    constructor() {
        this.form = this.fb.group({
            status_id: [null, Validators.required],
            comment: ['']
        });
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['visible'] && this.visible) {
            this.resetForm();
        }
    }

    resetForm(): void {
        this.form.reset();
        this.submitted = false;
    }

    onCancel(): void {
        this.visible = false;
        this.visibleChange.emit(false);
        this.cancel.emit();
    }

    onSubmit(): void {
        this.submitted = true;

        if (this.form.invalid) {
            return;
        }

        const request: ChangeStatusRequest = {
            status_id: this.form.value.status_id,
            comment: this.form.value.comment || undefined
        };

        this.confirm.emit(request);
    }
}
