import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DialogComponent } from '@/layout/component/dialog/dialog/dialog.component';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Piezometer } from '@/core/interfaces/filtration';

@Component({
    selector: 'app-piezometer-dialog',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, DialogComponent, InputTextModule, InputNumberModule, SelectModule, TranslateModule],
    templateUrl: './piezometer-dialog.component.html'
})
export class PiezometerDialogComponent implements OnChanges {
    @Input() visible = false;
    @Input() piezometer: Piezometer | null = null;
    @Input() submitting = false;
    @Output() visibleChange = new EventEmitter<boolean>();
    @Output() save = new EventEmitter<any>();

    form!: FormGroup;
    typeOptions: { label: string; value: string }[] = [];

    constructor(private fb: FormBuilder, private translate: TranslateService) {
        this.initForm();
        this.buildTypeOptions();
        this.translate.onLangChange.subscribe(() => this.buildTypeOptions());
    }

    private buildTypeOptions(): void {
        this.typeOptions = [
            { label: this.translate.instant('FILTRATION.PRESSURE'), value: 'pressure' },
            { label: this.translate.instant('FILTRATION.NON_PRESSURE'), value: 'non_pressure' }
        ];
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['piezometer'] || changes['visible']) {
            if (this.visible) {
                this.piezometer ? this.populateForm() : this.initForm();
            }
        }
    }

    private initForm(): void {
        this.form = this.fb.group({
            name: ['', Validators.required],
            type: ['pressure', Validators.required],
            norm: [null],
            sort_order: [0]
        });
    }

    private populateForm(): void {
        if (!this.piezometer) return;
        this.form = this.fb.group({
            name: [this.piezometer.name, Validators.required],
            type: [this.piezometer.type, Validators.required],
            norm: [this.piezometer.norm],
            sort_order: [this.piezometer.sort_order]
        });
    }

    onSave(): void {
        if (this.form.valid) {
            this.save.emit(this.form.value);
        }
    }

    onCancel(): void {
        this.visibleChange.emit(false);
    }
}
