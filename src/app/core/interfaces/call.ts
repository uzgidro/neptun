export type CallType = 'incoming' | 'outgoing' | 'missed';
export type CallStatus = 'completed' | 'no_answer' | 'busy' | 'cancelled';

export interface Call {
    id: number;
    date: string;
    time: string;
    type: CallType;
    callerName: string;
    callerPhone: string;
    receiverName?: string;
    receiverPhone?: string;
    duration?: number; // in seconds
    status: CallStatus;
    notes?: string;
    createdAt: string;
    updatedAt?: string;
}

export interface CallPayload {
    date: string;
    time: string;
    type: CallType;
    callerName: string;
    callerPhone: string;
    receiverName?: string;
    receiverPhone?: string;
    duration?: number;
    status: CallStatus;
    notes?: string;
}
