export type OrderStatus = 'draft' | 'pending' | 'signed' | 'cancelled';

export interface Order {
    id: number;
    number: string;           // Номер приказа
    date: string;             // Дата приказа
    title: string;            // Название/Тема
    description?: string;     // Описание
    fileUrl?: string;         // URL PDF файла
    fileName?: string;        // Имя файла
    status: OrderStatus;      // Статус
    signedBy?: string;        // Кто подписал
    createdAt: string;        // Дата создания
    updatedAt?: string;       // Дата обновления
}

export interface OrderPayload {
    number: string;
    date: string;
    title: string;
    description?: string;
    status: OrderStatus;
    signedBy?: string;
}
