export interface PersonnelRecord {
    id: number;
    employee_id: number;
    employee_name: string;
    employee_photo?: string;
    tab_number: string;
    hire_date: string;
    department_id: number;
    department_name?: string;
    position_id: number;
    position_name?: string;
    contract_type: 'permanent' | 'temporary' | 'contract';
    contract_end_date?: string;
    status: 'active' | 'on_leave' | 'dismissed';
    documents?: PersonnelDocument[];
    transfers?: PersonnelTransfer[];
    created_at?: string;
    updated_at?: string;
}

export interface PersonnelDocument {
    id: number;
    personnel_record_id: number;
    document_type: string;
    document_number: string;
    issue_date: string;
    expiry_date?: string;
    file_url?: string;
    created_at?: string;
}

export interface PersonnelTransfer {
    id: number;
    personnel_record_id: number;
    from_department_id: number;
    from_department_name?: string;
    to_department_id: number;
    to_department_name?: string;
    from_position_id: number;
    from_position_name?: string;
    to_position_id: number;
    to_position_name?: string;
    transfer_date: string;
    order_number: string;
    reason: string;
    created_at?: string;
}

export interface PersonnelRecordPayload {
    employee_id?: number;
    tab_number?: string;
    hire_date?: string;
    department_id?: number;
    position_id?: number;
    contract_type?: string;
    contract_end_date?: string;
    status?: string;
}
