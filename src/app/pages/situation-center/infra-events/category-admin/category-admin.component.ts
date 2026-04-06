import { Component, EventEmitter, inject, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { MessageService, PrimeTemplate } from 'primeng/api';
import { Dialog } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { InputNumber } from 'primeng/inputnumber';
import { TooltipModule } from 'primeng/tooltip';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { InfraEventService } from '@/core/services/infra-event.service';
import { InfraEventCategory, InfraEventCategoryPayload } from '@/core/interfaces/infra-event';

@Component({
    selector: 'app-category-admin',
    standalone: true,
    imports: [
        ReactiveFormsModule,
        PrimeTemplate,
        Dialog,
        TableModule,
        Button,
        InputText,
        InputNumber,
        TooltipModule,
        TranslateModule
    ],
    templateUrl: './category-admin.component.html'
})
export class CategoryAdminComponent implements OnInit, OnDestroy {
    @Input() visible = false;
    @Output() visibleChange = new EventEmitter<boolean>();
    @Input() categories: InfraEventCategory[] = [];
    @Output() categoriesChanged = new EventEmitter<void>();

    isFormOpen = false;
    isEditMode = false;
    currentCategoryId: number | null = null;
    submitted = false;
    isLoading = false;
    form!: FormGroup;

    private fb = inject(FormBuilder);
    private infraEventService = inject(InfraEventService);
    private messageService = inject(MessageService);
    private translate = inject(TranslateService);
    private destroy$ = new Subject<void>();

    ngOnInit(): void {
        this.form = this.fb.group({
            slug: this.fb.control<string>('', [Validators.required]),
            display_name: this.fb.control<string>('', [Validators.required]),
            label: this.fb.control<string>('', [Validators.required]),
            sort_order: this.fb.control<number>(0)
        });
    }

    onDialogHide(): void {
        this.visibleChange.emit(false);
    }

    openNew(): void {
        this.isEditMode = false;
        this.currentCategoryId = null;
        this.form.reset({ sort_order: 0 });
        this.submitted = false;
        this.isLoading = false;
        this.isFormOpen = true;
    }

    editCategory(cat: InfraEventCategory): void {
        this.isEditMode = true;
        this.currentCategoryId = cat.id;
        this.form.patchValue({
            slug: cat.slug,
            display_name: cat.display_name,
            label: cat.label,
            sort_order: cat.sort_order
        });
        this.submitted = false;
        this.isLoading = false;
        this.isFormOpen = true;
    }

    onSubmit(): void {
        this.submitted = true;
        if (this.form.invalid) return;

        this.isLoading = true;
        const payload: InfraEventCategoryPayload = this.form.getRawValue();

        if (this.isEditMode && this.currentCategoryId) {
            this.infraEventService
                .updateInfraCategory(this.currentCategoryId, payload)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: () => {
                        this.messageService.add({ severity: 'success', summary: this.translate.instant('SITUATION_CENTER.INFRA_EVENTS.CATEGORY.UPDATED') });
                        this.isLoading = false;
                        this.isFormOpen = false;
                        this.categoriesChanged.emit();
                    },
                    error: (err) => {
                        if (err.status === 409) {
                            this.messageService.add({ severity: 'error', summary: this.translate.instant('COMMON.ERROR'), detail: err.error?.error || 'Duplicate slug' });
                        } else {
                            this.messageService.add({ severity: 'error', summary: this.translate.instant('COMMON.ERROR'), detail: err.error?.error || err.message });
                        }
                        this.isLoading = false;
                    }
                });
        } else {
            this.infraEventService
                .createInfraCategory(payload)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: () => {
                        this.messageService.add({ severity: 'success', summary: this.translate.instant('SITUATION_CENTER.INFRA_EVENTS.CATEGORY.CREATED') });
                        this.isLoading = false;
                        this.isFormOpen = false;
                        this.categoriesChanged.emit();
                    },
                    error: (err) => {
                        if (err.status === 409) {
                            this.messageService.add({ severity: 'error', summary: this.translate.instant('COMMON.ERROR'), detail: err.error?.error || 'Duplicate slug' });
                        } else {
                            this.messageService.add({ severity: 'error', summary: this.translate.instant('COMMON.ERROR'), detail: err.error?.error || err.message });
                        }
                        this.isLoading = false;
                    }
                });
        }
    }

    deleteCategory(cat: InfraEventCategory): void {
        if (confirm(this.translate.instant('COMMON.CONFIRM_DELETE'))) {
            this.infraEventService
                .deleteInfraCategory(cat.id)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: () => {
                        this.messageService.add({ severity: 'success', summary: this.translate.instant('SITUATION_CENTER.INFRA_EVENTS.CATEGORY.DELETED') });
                        this.categoriesChanged.emit();
                    },
                    error: (err) => {
                        if (err.status === 409) {
                            this.messageService.add({
                                severity: 'error',
                                summary: this.translate.instant('COMMON.ERROR'),
                                detail: this.translate.instant('SITUATION_CENTER.INFRA_EVENTS.CATEGORY.HAS_EVENTS_ERROR')
                            });
                        } else {
                            this.messageService.add({ severity: 'error', summary: this.translate.instant('COMMON.ERROR'), detail: err.error?.error || err.message });
                        }
                    }
                });
        }
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
