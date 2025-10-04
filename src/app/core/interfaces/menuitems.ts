import { MenuItem } from 'primeng/api';

export interface MenuItems extends MenuItem {
    role?: string | string[]
}
