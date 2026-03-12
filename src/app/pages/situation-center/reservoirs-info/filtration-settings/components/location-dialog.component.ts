import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DialogComponent } from '@/layout/component/dialog/dialog/dialog.component';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { TranslateModule } from '@ngx-translate/core';
import { Location } from '@/core/interfaces/filtration';

@Component({
    selector: 'app-location-dialog',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, DialogComponent, InputTextModule, InputNumberModule, TranslateModule],
    templateUrl: './location-dialog.component.html'
})
export class LocationDialogComponent implements OnChanges {
    @Input() visible = false;
    @Input() location: Location | null = null;
    @Input() submitting = false;
    @Output() visibleChange = new EventEmitter<boolean>();
    @Output() save = new EventEmitter<any>();

    form!: FormGroup;

    constructor(private fb: FormBuilder) {
        this.initForm();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['location'] || changes['visible']) {
            if (this.visible) {
                this.location ? this.populateForm() : this.initForm();
            }
        }
    }

    private initForm(): void {
        this.form = this.fb.group({
            name: ['', Validators.required],
            norm: [null],
            sort_order: [0]
        });
    }

    private populateForm(): void {
        if (!this.location) return;
        this.form = this.fb.group({
            name: [this.location.name, Validators.required],
            norm: [this.location.norm],
            sort_order: [this.location.sort_order]
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
