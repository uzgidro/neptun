export type ResolutionType = 'president' | 'cabinet' | 'decree' | 'order' | 'agreement';
export type ResolutionStatus = 'draft' | 'active' | 'cancelled' | 'expired';

export interface Resolution {
    id: number;
    number: string;
    date: string;
    title: string;
    description?: string;
    type: ResolutionType;
    status: ResolutionStatus;
    issuedBy?: string;
    effectiveDate?: string;
    expirationDate?: string;
    fileUrl?: string;
    fileName?: string;
    createdAt: string;
    updatedAt?: string;
}

export interface ResolutionPayload {
    number: string;
    date: string;
    title: string;
    description?: string;
    type: ResolutionType;
    status: ResolutionStatus;
    issuedBy?: string;
    effectiveDate?: string;
    expirationDate?: string;
    fileUrl?: string;
    fileName?: string;
}
