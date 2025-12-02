import { Contact } from '@/core/interfaces/contact';

export interface FastCall {
    id: number;
    contact_id: number;
    position: number;
    contact: Contact;
}
