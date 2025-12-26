export type InstructionCategory = 'safety' | 'operation' | 'technical' | 'administrative' | 'other';
export type InstructionStatus = 'active' | 'archived' | 'pending';

export interface Instruction {
    id: number;
    number: string;                   // Номер инструкции
    date: string;                     // Дата утверждения
    title: string;                    // Название
    description?: string;             // Описание
    category: InstructionCategory;    // Категория
    status: InstructionStatus;        // Статус
    approvedBy?: string;              // Кто утвердил
    fileUrl?: string;                 // URL файла
    fileName?: string;                // Имя файла
    createdAt: string;                // Дата создания
    updatedAt?: string;               // Дата обновления
}

export interface InstructionPayload {
    number: string;
    date: string;
    title: string;
    description?: string;
    category: InstructionCategory;
    status: InstructionStatus;
    approvedBy?: string;
}
