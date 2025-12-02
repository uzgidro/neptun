export interface DCValue {
    yearStartValue: number;
    currentValue: number;
    diff: number;
}

export interface DebitCredit {
    name: string;
    debit: DCValue;
    credit: DCValue;
    items?: DebitCredit[];
}

export interface DCInfo {
    debit: DCValue;
    credit: DCValue;
    items: DebitCredit[];
    startDate: Date;
    currentDate: Date;
}
