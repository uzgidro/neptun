export type LetterType = 'incoming' | 'outgoing';
export type LetterStatus = 'draft' | 'sent' | 'received' | 'read';

export interface Letter {
    id: number;
    number: string;           // Номер письма
    date: string;             // Дата
    type: LetterType;         // Тип: входящее/исходящее
    from: string;             // От кого
    to: string;               // Кому
    subject: string;          // Тема
    content?: string;         // Содержание
    status: LetterStatus;     // Статус
    fileUrl?: string;         // URL файла
    fileName?: string;        // Имя файла
    createdAt: string;        // Дата создания
    updatedAt?: string;       // Дата обновления
}

export interface LetterPayload {
    number: string;
    date: string;
    type: LetterType;
    from: string;
    to: string;
    subject: string;
    content?: string;
    status: LetterStatus;
}
