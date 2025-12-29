export type ReportStatus = 'pending' | 'approved' | 'rejected';

export interface Report {
    id: number;
    number: string;           // Номер рапорта
    date: string;             // Дата
    from: string;             // От кого
    to: string;               // Кому
    subject: string;          // Тема
    content?: string;         // Содержание
    status: ReportStatus;     // Статус
    resolution?: string;      // Резолюция
    fileUrl?: string;         // URL файла
    fileName?: string;        // Имя файла
    createdAt: string;        // Дата создания
    updatedAt?: string;       // Дата обновления
}

export interface ReportPayload {
    number: string;
    date: string;
    from: string;
    to: string;
    subject: string;
    content?: string;
    status: ReportStatus;
    resolution?: string;
}
