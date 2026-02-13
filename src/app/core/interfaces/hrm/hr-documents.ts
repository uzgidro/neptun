// HR Documents - Электронный документооборот

export interface HRDocument {
    id: number;
    document_number: string;
    title: string;
    type: DocumentType;
    category: DocumentCategory;
    status: DocumentStatus;
    employee_id?: number;
    employee_name?: string;
    department_id?: number;
    department_name?: string;
    description?: string;
    file_url?: string;
    file_name?: string;
    file_size?: number; // bytes
    file_type?: string; // mime type
    created_by: number;
    created_by_name: string;
    created_at: string;
    updated_at?: string;
    valid_from?: string;
    valid_until?: string;
    requires_signature: boolean;
    signatures?: DocumentSignature[];
    version: number;
    is_template: boolean;
    template_id?: number;
    tags?: string[];
}

export interface DocumentSignature {
    id: number;
    document_id: number;
    signer_id: number;
    signer_name: string;
    signer_position: string;
    status: SignatureStatus;
    signed_at?: string;
    comment?: string;
    order: number; // порядок подписания
}

export interface DocumentTemplate {
    id: number;
    name: string;
    type: DocumentType;
    category: DocumentCategory;
    description?: string;
    content: string; // HTML or template markup
    placeholders: TemplatePlaceholder[];
    is_active: boolean;
    created_at: string;
    updated_at?: string;
}

export interface TemplatePlaceholder {
    key: string;
    label: string;
    type: 'text' | 'date' | 'number' | 'employee' | 'department';
    required: boolean;
    default_value?: string;
}

export interface DocumentRequest {
    id: number;
    document_type: DocumentType;
    employee_id: number;
    employee_name: string;
    department_name: string;
    purpose?: string;
    status: RequestStatus;
    requested_at: string;
    processed_at?: string;
    processed_by?: number;
    processed_by_name?: string;
    document_id?: number; // связь с созданным документом
    rejection_reason?: string;
    copies_count: number;
}

export interface DocumentFilter {
    search?: string;
    type?: DocumentType;
    category?: DocumentCategory;
    status?: DocumentStatus;
    employee_id?: number;
    department_id?: number;
    date_from?: string;
    date_to?: string;
    requires_my_signature?: boolean;
}

export interface DocumentStats {
    total_documents: number;
    pending_signatures: number;
    my_pending_signatures: number;
    expiring_soon: number; // документы с истекающим сроком
    requests_pending: number;
    documents_by_type: { type: DocumentType; count: number }[];
    documents_by_status: { status: DocumentStatus; count: number }[];
}

// Types
export type DocumentType =
    | 'employment_contract'    // Трудовой договор
    | 'contract_amendment'     // Дополнительное соглашение
    | 'order'                  // Приказ
    | 'statement'              // Заявление
    | 'certificate'            // Справка
    | 'memo'                   // Служебная записка
    | 'act'                    // Акт
    | 'protocol'               // Протокол
    | 'regulation'             // Положение
    | 'instruction'            // Инструкция
    | 'report'                 // Отчёт
    | 'other';                 // Прочее

export type DocumentCategory =
    | 'personnel'              // Кадровые
    | 'financial'              // Финансовые
    | 'administrative'         // Административные
    | 'regulatory'             // Нормативные
    | 'organizational';        // Организационные

export type DocumentStatus =
    | 'draft'                  // Черновик
    | 'pending_signature'      // На подписании
    | 'signed'                 // Подписан
    | 'rejected'               // Отклонён
    | 'expired'                // Истёк срок
    | 'archived';              // В архиве

export type SignatureStatus =
    | 'pending'                // Ожидает подписи
    | 'signed'                 // Подписано
    | 'rejected';              // Отклонено

export type RequestStatus =
    | 'pending'                // На рассмотрении
    | 'in_progress'            // В работе
    | 'completed'              // Выполнено
    | 'rejected';              // Отклонено

// Constants
export const DOCUMENT_TYPES: { value: DocumentType; label: string; icon: string }[] = [
    { value: 'employment_contract', label: 'Трудовой договор', icon: 'pi-file-edit' },
    { value: 'contract_amendment', label: 'Доп. соглашение', icon: 'pi-file-plus' },
    { value: 'order', label: 'Приказ', icon: 'pi-file' },
    { value: 'statement', label: 'Заявление', icon: 'pi-file-word' },
    { value: 'certificate', label: 'Справка', icon: 'pi-id-card' },
    { value: 'memo', label: 'Служебная записка', icon: 'pi-envelope' },
    { value: 'act', label: 'Акт', icon: 'pi-file-check' },
    { value: 'protocol', label: 'Протокол', icon: 'pi-list' },
    { value: 'regulation', label: 'Положение', icon: 'pi-book' },
    { value: 'instruction', label: 'Инструкция', icon: 'pi-info-circle' },
    { value: 'report', label: 'Отчёт', icon: 'pi-chart-bar' },
    { value: 'other', label: 'Прочее', icon: 'pi-folder' }
];

export const DOCUMENT_CATEGORIES: { value: DocumentCategory; label: string }[] = [
    { value: 'personnel', label: 'Кадровые' },
    { value: 'financial', label: 'Финансовые' },
    { value: 'administrative', label: 'Административные' },
    { value: 'regulatory', label: 'Нормативные' },
    { value: 'organizational', label: 'Организационные' }
];

export const DOCUMENT_STATUSES: { value: DocumentStatus; label: string; severity: string }[] = [
    { value: 'draft', label: 'Черновик', severity: 'secondary' },
    { value: 'pending_signature', label: 'На подписании', severity: 'warn' },
    { value: 'signed', label: 'Подписан', severity: 'success' },
    { value: 'rejected', label: 'Отклонён', severity: 'danger' },
    { value: 'expired', label: 'Истёк срок', severity: 'danger' },
    { value: 'archived', label: 'В архиве', severity: 'info' }
];

export const REQUEST_STATUSES: { value: RequestStatus; label: string; severity: string }[] = [
    { value: 'pending', label: 'На рассмотрении', severity: 'warn' },
    { value: 'in_progress', label: 'В работе', severity: 'info' },
    { value: 'completed', label: 'Выполнено', severity: 'success' },
    { value: 'rejected', label: 'Отклонено', severity: 'danger' }
];

export const SIGNATURE_STATUSES: { value: SignatureStatus; label: string; severity: string }[] = [
    { value: 'pending', label: 'Ожидает', severity: 'warn' },
    { value: 'signed', label: 'Подписано', severity: 'success' },
    { value: 'rejected', label: 'Отклонено', severity: 'danger' }
];
