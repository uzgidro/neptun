import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { Instruction, InstructionPayload, InstructionCategory, InstructionStatus } from '@/core/interfaces/instruction';

@Injectable({
    providedIn: 'root'
})
export class InstructionService {
    private mockInstructions: Instruction[] = [
        {
            id: 1,
            number: 'ИН-001',
            date: '2024-01-15',
            title: 'Инструкция по охране труда при работе на высоте',
            description: 'Правила безопасности при выполнении работ на высоте более 1.8 метра',
            category: 'safety',
            status: 'active',
            approvedBy: 'Директор Иванов И.И.',
            createdAt: '2024-01-15T10:00:00'
        },
        {
            id: 2,
            number: 'ИН-002',
            date: '2024-02-01',
            title: 'Инструкция по эксплуатации производственных линий',
            description: 'Порядок запуска, остановки и обслуживания производственных линий',
            category: 'operation',
            status: 'active',
            approvedBy: 'Главный инженер Петров П.П.',
            createdAt: '2024-02-01T09:00:00'
        },
        {
            id: 3,
            number: 'ИН-003',
            date: '2024-03-10',
            title: 'Инструкция по техническому обслуживанию оборудования',
            description: 'Регламент планового технического обслуживания производственного оборудования',
            category: 'technical',
            status: 'active',
            approvedBy: 'Главный инженер Петров П.П.',
            createdAt: '2024-03-10T14:00:00'
        },
        {
            id: 4,
            number: 'ИН-004',
            date: '2024-04-20',
            title: 'Инструкция по документообороту',
            description: 'Правила оформления и регистрации документов',
            category: 'administrative',
            status: 'pending',
            createdAt: '2024-04-20T11:00:00'
        },
        {
            id: 5,
            number: 'ИН-005',
            date: '2023-06-01',
            title: 'Инструкция по пожарной безопасности (старая)',
            description: 'Устаревшая версия инструкции по пожарной безопасности',
            category: 'safety',
            status: 'archived',
            approvedBy: 'Директор Сидоров С.С.',
            createdAt: '2023-06-01T10:00:00'
        }
    ];

    private nextId = 6;

    getAll(): Observable<Instruction[]> {
        return of([...this.mockInstructions]).pipe(delay(300));
    }

    getById(id: number): Observable<Instruction | undefined> {
        const instruction = this.mockInstructions.find(i => i.id === id);
        return of(instruction).pipe(delay(200));
    }

    create(payload: InstructionPayload): Observable<Instruction> {
        const newInstruction: Instruction = {
            id: this.nextId++,
            ...payload,
            createdAt: new Date().toISOString()
        };
        this.mockInstructions.unshift(newInstruction);
        return of(newInstruction).pipe(delay(300));
    }

    update(id: number, payload: InstructionPayload): Observable<Instruction> {
        const index = this.mockInstructions.findIndex(i => i.id === id);
        if (index !== -1) {
            this.mockInstructions[index] = {
                ...this.mockInstructions[index],
                ...payload,
                updatedAt: new Date().toISOString()
            };
            return of(this.mockInstructions[index]).pipe(delay(300));
        }
        throw new Error('Instruction not found');
    }

    delete(id: number): Observable<void> {
        const index = this.mockInstructions.findIndex(i => i.id === id);
        if (index !== -1) {
            this.mockInstructions.splice(index, 1);
        }
        return of(undefined).pipe(delay(300));
    }

    getCategoryLabel(category: InstructionCategory): string {
        const labels: Record<InstructionCategory, string> = {
            safety: 'Безопасность',
            operation: 'Эксплуатация',
            technical: 'Техническая',
            administrative: 'Административная',
            other: 'Прочее'
        };
        return labels[category];
    }

    getCategorySeverity(category: InstructionCategory): 'info' | 'warn' | 'success' | 'danger' | 'secondary' | 'contrast' {
        const severities: Record<InstructionCategory, 'info' | 'warn' | 'success' | 'danger' | 'secondary'> = {
            safety: 'danger',
            operation: 'info',
            technical: 'warn',
            administrative: 'secondary',
            other: 'secondary'
        };
        return severities[category];
    }

    getStatusLabel(status: InstructionStatus): string {
        const labels: Record<InstructionStatus, string> = {
            active: 'Действующая',
            archived: 'Архивная',
            pending: 'На утверждении'
        };
        return labels[status];
    }

    getStatusSeverity(status: InstructionStatus): 'info' | 'warn' | 'success' | 'danger' | 'secondary' | 'contrast' {
        const severities: Record<InstructionStatus, 'success' | 'secondary' | 'warn'> = {
            active: 'success',
            archived: 'secondary',
            pending: 'warn'
        };
        return severities[status];
    }
}
