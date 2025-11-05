export interface Users {
    id: number;
    name: string
    roles: string[]
}

export interface UserShortInfo {
    id: number;
    fio: string | null;
}
