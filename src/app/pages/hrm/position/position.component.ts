import { Component, inject, OnInit } from '@angular/core';
import { TableModule } from 'primeng/table';
import { Position, PositionPayload } from '@/core/interfaces/position';
import { PositionService } from '@/core/services/position.service';
import { ButtonDirective, ButtonIcon, ButtonLabel } from 'primeng/button';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import { FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextComponent } from '@/layout/component/dialog/input-text/input-text.component';
import { DeleteConfirmationComponent } from '@/layout/component/dialog/delete-confirmation/delete-confirmation.component';
import { Tooltip } from 'primeng/tooltip';
import { DialogComponent } from '@/layout/component/dialog/dialog/dialog.component';
import { BaseCrudComponent } from '@/core/components/base-crud.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-position',
    imports: [TableModule, ButtonDirective, IconField, InputIcon, InputText, ButtonLabel, ButtonIcon, ReactiveFormsModule, InputTextComponent, DeleteConfirmationComponent, Tooltip, DialogComponent, TranslateModule],
    templateUrl: './position.component.html',
    styleUrl: './position.component.scss'
})
export class PositionComponent extends BaseCrudComponent<Position, PositionPayload> implements OnInit {
    constructor() {
        super(inject(PositionService), {
            createSuccess: 'HRM.POSITIONS.SUCCESS_CREATED',
            createError: 'HRM.POSITIONS.ERROR_CREATE',
            updateSuccess: 'HRM.POSITIONS.SUCCESS_UPDATED',
            updateError: 'HRM.POSITIONS.ERROR_UPDATE',
            deleteSuccess: 'HRM.POSITIONS.SUCCESS_DELETED',
            deleteError: 'HRM.POSITIONS.ERROR_DELETE'
        });
    }

    ngOnInit(): void {
        this.loadItems();
    }

    protected buildForm(): FormGroup {
        return this.fb.group({
            name: ['', Validators.required],
            description: ['']
        });
    }

    protected buildPayload(): PositionPayload {
        const formValue = this.form.value;
        return {
            name: formValue.name,
            description: formValue.description || undefined
        };
    }

    protected patchFormForEdit(position: Position): void {
        this.form.patchValue({
            name: position.name,
            description: position.description || ''
        });
    }

    // Alias for template compatibility
    get positions(): Position[] {
        return this.items;
    }

    get positionForm(): FormGroup {
        return this.form;
    }

    get selectedPosition(): Position | null {
        return this.selectedItem;
    }
}
