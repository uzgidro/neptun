import { Component, DestroyRef, ElementRef, forwardRef, inject, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { FloatLabel } from 'primeng/floatlabel';
import { Select } from 'primeng/select';
import { NgClass } from '@angular/common';
import { Message } from 'primeng/message';
import { PrimeTemplate } from 'primeng/api';
import { InputText } from 'primeng/inputtext';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { TranslateService } from '@ngx-translate/core';

let nextId = 0;

@Component({
    selector: 'app-group-select',
    imports: [FloatLabel, Select, FormsModule, NgClass, Message, PrimeTemplate, ReactiveFormsModule, InputText, IconField, InputIcon],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => GroupSelectComponent),
            multi: true
        }
    ],
    templateUrl: './group-select.component.html',
    styleUrl: './group-select.component.scss'
})
export class GroupSelectComponent implements ControlValueAccessor, OnChanges {
    @Input() label: string = 'Выбор';
    @Input() loading: boolean = false;
    @Input() disable: boolean = false;
    @Input() submitted: boolean = false;
    @Input() required: boolean = true;
    @Input() showClear: boolean = true;
    @Input() errorMessage: string = 'Выбор обязателен';

    @Input() items: any[] = [];

    @Input() optionLabel: string = 'name';
    @Input() optionValue: string | undefined;
    @Input() placeholder: string | undefined;
    @Input() styleClass: string = '';
    @Input() style: Record<string, string> | undefined;
    @Input() appendTo: string = 'body';

    filteredItems: any[] = [];

    @ViewChild('filterInput') filterInput!: ElementRef<HTMLInputElement>;
    @ViewChild(Select) selectComponent!: Select;

    internalValue: any = null;
    isDisabled: boolean = false;
    uniqueId: string;
    emptyFilterMessage: string = '';

    private destroyRef = inject(DestroyRef);
    private translate = inject(TranslateService);
    protected onChange = (value: any) => {};
    protected onTouched = () => {};

    constructor() {
        this.uniqueId = 'group_select_' + nextId++;
        this.updateEmptyMessage();
        this.translate.onLangChange
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => this.updateEmptyMessage());
        this.translate.onTranslationChange
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => this.updateEmptyMessage());
    }

    private updateEmptyMessage(): void {
        const msg = this.translate.instant('COMMON.NO_RESULTS');
        this.emptyFilterMessage = msg !== 'COMMON.NO_RESULTS' ? msg : 'Ничего не найдено';
    }

    writeValue(value: any): void {
        this.internalValue = value;
    }

    registerOnChange(fn: any): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    setDisabledState(isDisabled: boolean): void {
        this.isDisabled = isDisabled;
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['items']) {
            this.filteredItems = this.items;
        }
    }

    onFilterInput(event: Event): void {
        const query = ((event.target as HTMLInputElement).value || '').toLowerCase().trim();
        if (!query) {
            this.filteredItems = this.items;
            return;
        }

        this.filteredItems = this.items
            .map(group => {
                const groupMatches = (group.label || group.name || '').toLowerCase().includes(query);
                if (groupMatches) {
                    return group;
                }
                const filteredItems = (group.items || []).filter((item: any) =>
                    (item.label || item.name || '').toLowerCase().includes(query)
                );
                return filteredItems.length ? { ...group, items: filteredItems } : null;
            })
            .filter(Boolean);
    }

    onFilterKeyDown(event: KeyboardEvent): void {
        this.selectComponent.onFilterKeyDown(event);
    }

    onDropdownShow(): void {
        setTimeout(() => this.filterInput?.nativeElement.focus());
    }

    onDropdownHide(): void {
        this.filteredItems = this.items;
        if (this.filterInput?.nativeElement) {
            this.filterInput.nativeElement.value = '';
        }
    }

    onValueChange(newValue: any) {
        this.internalValue = newValue;
        this.onChange(newValue);
    }
}
