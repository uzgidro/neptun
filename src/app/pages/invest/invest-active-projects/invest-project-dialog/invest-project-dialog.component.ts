import { Component, EventEmitter, inject, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService, PrimeTemplate } from 'primeng/api';
import { Dialog } from 'primeng/dialog';
import { FloatLabel } from 'primeng/floatlabel';
import { InputText } from 'primeng/inputtext';
import { InputNumber } from 'primeng/inputnumber';
import { Textarea } from 'primeng/textarea';
import { ButtonDirective } from 'primeng/button';
import { NgClass } from '@angular/common';
import { InvestActiveProject } from '@/core/interfaces/invest-active-project';
import {
    InvestActiveProjectService,
    AddInvestActiveProjectRequest,
    EditInvestActiveProjectRequest
} from '@/core/services/invest-active-project.service';

@Component({
    selector: 'app-invest-project-dialog',
    standalone: true,
    imports: [
        Dialog,
        ReactiveFormsModule,
        FormsModule,
        FloatLabel,
        InputText,
        InputNumber,
        Textarea,
        PrimeTemplate,
        NgClass,
        ButtonDirective
    ],
    templateUrl: './invest-project-dialog.component.html',
    styleUrl: './invest-project-dialog.component.scss'
})
export class InvestProjectDialogComponent implements OnInit, OnChanges {
    @Input() display: boolean = false;
    @Input() projectToEdit: InvestActiveProject | null = null;

    @Output() displayChange = new EventEmitter<boolean>();
    @Output() save = new EventEmitter<void>();

    projectForm!: FormGroup;
    submitted: boolean = false;

    private projectService = inject(InvestActiveProjectService);
    private messageService = inject(MessageService);
    private fb = inject(FormBuilder);

    get isEditMode(): boolean {
        return !!this.projectToEdit;
    }

    ngOnInit() {
        this.projectForm = this.fb.group({
            category: ['', [Validators.required]],
            project_name: ['', [Validators.required]],
            foreign_partner: [''],
            implementation_period: [''],
            capacity_mw: [null, [Validators.min(0)]],
            production_mln_kwh: [null, [Validators.min(0)]],
            cost_mln_usd: [null, [Validators.min(0)]],
            status_text: ['']
        });
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['display'] && this.display) {
            this.onDialogShow();
        }
    }

    onDialogShow(): void {
        this.submitted = false;
        this.projectForm.reset();

        if (this.projectToEdit) {
            this.projectForm.patchValue({
                category: this.projectToEdit.category,
                project_name: this.projectToEdit.project_name,
                foreign_partner: this.projectToEdit.foreign_partner || '',
                implementation_period: this.projectToEdit.implementation_period || '',
                capacity_mw: this.projectToEdit.capacity_mw,
                production_mln_kwh: this.projectToEdit.production_mln_kwh,
                cost_mln_usd: this.projectToEdit.cost_mln_usd,
                status_text: this.projectToEdit.status_text || ''
            });
        }
    }

    closeDialog(): void {
        this.displayChange.emit(false);
    }

    onVisibleChange(visible: boolean): void {
        this.displayChange.emit(visible);
        if (!visible) {
            this.submitted = false;
            this.projectForm.reset();
        }
    }

    onSubmit(): void {
        this.submitted = true;

        if (this.projectForm.invalid) {
            console.warn('Форма невалидна');
            return;
        }

        const rawValue = this.projectForm.getRawValue();

        if (this.isEditMode) {
            const editData: EditInvestActiveProjectRequest = {};

            if (rawValue.category) editData.category = rawValue.category;
            if (rawValue.project_name) editData.project_name = rawValue.project_name;
            if (rawValue.foreign_partner) editData.foreign_partner = rawValue.foreign_partner;
            if (rawValue.implementation_period) editData.implementation_period = rawValue.implementation_period;
            if (rawValue.capacity_mw !== null) editData.capacity_mw = rawValue.capacity_mw;
            if (rawValue.production_mln_kwh !== null) editData.production_mln_kwh = rawValue.production_mln_kwh;
            if (rawValue.cost_mln_usd !== null) editData.cost_mln_usd = rawValue.cost_mln_usd;
            if (rawValue.status_text) editData.status_text = rawValue.status_text;

            this.projectService.edit(this.projectToEdit!.id, editData).subscribe({
                next: () => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Успешно',
                        detail: 'Проект успешно обновлен'
                    });
                    this.save.emit();
                    this.closeDialog();
                },
                error: (err) => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Ошибка сохранения',
                        detail: err.error?.message || 'Не удалось обновить проект'
                    });
                }
            });
        } else {
            const addData: AddInvestActiveProjectRequest = {
                category: rawValue.category,
                project_name: rawValue.project_name
            };

            if (rawValue.foreign_partner) addData.foreign_partner = rawValue.foreign_partner;
            if (rawValue.implementation_period) addData.implementation_period = rawValue.implementation_period;
            if (rawValue.capacity_mw !== null) addData.capacity_mw = rawValue.capacity_mw;
            if (rawValue.production_mln_kwh !== null) addData.production_mln_kwh = rawValue.production_mln_kwh;
            if (rawValue.cost_mln_usd !== null) addData.cost_mln_usd = rawValue.cost_mln_usd;
            if (rawValue.status_text) addData.status_text = rawValue.status_text;

            this.projectService.add(addData).subscribe({
                next: () => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Успешно',
                        detail: 'Новый проект добавлен'
                    });
                    this.save.emit();
                    this.closeDialog();
                },
                error: (err) => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Ошибка сохранения',
                        detail: err.error?.message || 'Не удалось добавить проект'
                    });
                }
            });
        }
    }
}
