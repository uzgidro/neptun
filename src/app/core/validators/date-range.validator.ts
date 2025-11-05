import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function dateRangeValidator(): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {

        // Получаем значения из контролов
        const start = group.get('started_at')?.value;
        const end = group.get('ended_at')?.value;

        // 1. Если 'ended_at' не заполнено, ошибки нет
        // (Если 'started_at' не заполнено, сработает 'required' на нем)
        if (!start || !end) {
            return null;
        }

        // 2. Сравниваем даты. Если 'end' раньше 'start', возвращаем ошибку
        return (end < start) ? { 'endDateBeforeStart': true } : null;
    };
}
