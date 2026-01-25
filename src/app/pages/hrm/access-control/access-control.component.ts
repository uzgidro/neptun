import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonDirective } from 'primeng/button';
import { Select } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { Tag } from 'primeng/tag';
import { Tooltip } from 'primeng/tooltip';
import { Dialog } from 'primeng/dialog';
import { InputText } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';
import { TabsModule } from 'primeng/tabs';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { ProgressBar } from 'primeng/progressbar';
import { Checkbox } from 'primeng/checkbox';
import {
    AccessCard,
    AccessZone,
    AccessLog,
    AccessRequest,
    AccessStats,
    ZoneOccupancy,
    CardStatus,
    SecurityLevel,
    AccessEventStatus,
    RequestStatus,
    CARD_STATUSES,
    SECURITY_LEVELS,
    ACCESS_EVENT_STATUSES,
    REQUEST_STATUSES
} from '@/core/interfaces/hrm/access-control';

interface Employee {
    id: number;
    name: string;
    department: string;
    position: string;
}

@Component({
    selector: 'app-access-control',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ButtonDirective,
        Select,
        TableModule,
        Tag,
        Tooltip,
        Dialog,
        InputText,
        Textarea,
        TabsModule,
        ConfirmDialog,
        InputGroup,
        InputGroupAddon,
        ProgressBar,
        Checkbox
    ],
    providers: [ConfirmationService],
    templateUrl: './access-control.component.html',
    styleUrl: './access-control.component.scss'
})
export class AccessControlComponent implements OnInit, OnDestroy {
    // Data
    cards: AccessCard[] = [];
    zones: AccessZone[] = [];
    logs: AccessLog[] = [];
    requests: AccessRequest[] = [];
    employees: Employee[] = [];
    zoneOccupancy: ZoneOccupancy[] = [];

    // Stats
    stats: AccessStats = {
        total_cards: 0,
        active_cards: 0,
        blocked_cards: 0,
        expired_cards: 0,
        total_zones: 0,
        entries_today: 0,
        exits_today: 0,
        current_on_site: 0,
        denied_today: 0,
        pending_requests: 0
    };

    // Options
    cardStatuses = CARD_STATUSES;
    securityLevels = SECURITY_LEVELS;
    accessEventStatuses = ACCESS_EVENT_STATUSES;
    requestStatuses = REQUEST_STATUSES;

    // Filters
    searchQuery: string = '';
    selectedCardStatus: CardStatus | null = null;
    selectedZone: number | null = null;
    selectedLogStatus: AccessEventStatus | null = null;

    // State
    loading: boolean = false;
    activeTabIndex: number = 0;
    private refreshInterval: any;

    // Card Dialog
    displayCardDialog: boolean = false;
    isEditMode: boolean = false;
    selectedCard: AccessCard | null = null;
    cardForm: Partial<AccessCard> = {};
    selectedZonesForCard: number[] = [];

    // Request Dialog
    displayRequestDialog: boolean = false;
    selectedRequest: AccessRequest | null = null;
    rejectionReason: string = '';

    // Block Dialog
    displayBlockDialog: boolean = false;
    blockReason: string = '';

    private messageService = inject(MessageService);
    private confirmationService = inject(ConfirmationService);

    ngOnInit(): void {
        this.loadEmployees();
        this.loadZones();
        this.loadCards();
        this.loadLogs();
        this.loadRequests();
        this.calculateStats();
        this.startAutoRefresh();
    }

    ngOnDestroy(): void {
        this.stopAutoRefresh();
    }

    private startAutoRefresh(): void {
        this.refreshInterval = setInterval(() => {
            this.loadLogs();
            this.calculateStats();
        }, 30000); // Refresh every 30 seconds
    }

    private stopAutoRefresh(): void {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
    }

    private loadEmployees(): void {
        this.employees = [
            { id: 1, name: 'Иванов Иван Иванович', department: 'IT-отдел', position: 'Senior Developer' },
            { id: 2, name: 'Петрова Анна Сергеевна', department: 'IT-отдел', position: 'Frontend Developer' },
            { id: 3, name: 'Сидоров Пётр Николаевич', department: 'Бухгалтерия', position: 'Главный бухгалтер' },
            { id: 4, name: 'Козлова Мария Александровна', department: 'HR-отдел', position: 'HR-менеджер' },
            { id: 5, name: 'Новиков Алексей Дмитриевич', department: 'Юридический отдел', position: 'Юрист' }
        ];
    }

    private loadZones(): void {
        this.zones = [
            { id: 1, name: 'Главный вход', code: 'MAIN', location: 'Корпус А, 1 этаж', security_level: 'public', requires_escort: false, max_occupancy: 500, current_occupancy: 127, is_active: true, readers: [] },
            { id: 2, name: 'Офисные помещения', code: 'OFFICE', location: 'Корпус А, 2-5 этаж', security_level: 'standard', requires_escort: false, max_occupancy: 200, current_occupancy: 89, is_active: true, readers: [] },
            { id: 3, name: 'Серверная', code: 'SERVER', location: 'Корпус Б, подвал', security_level: 'high', requires_escort: true, max_occupancy: 10, current_occupancy: 2, is_active: true, readers: [] },
            { id: 4, name: 'Переговорные', code: 'MEETING', location: 'Корпус А, 3 этаж', security_level: 'standard', requires_escort: false, max_occupancy: 50, current_occupancy: 12, is_active: true, readers: [] },
            { id: 5, name: 'Склад', code: 'WAREHOUSE', location: 'Корпус В', security_level: 'restricted', requires_escort: false, max_occupancy: 30, current_occupancy: 5, is_active: true, readers: [] },
            { id: 6, name: 'Руководство', code: 'EXEC', location: 'Корпус А, 6 этаж', security_level: 'high', requires_escort: true, max_occupancy: 20, current_occupancy: 8, is_active: true, readers: [] }
        ];

        this.zoneOccupancy = this.zones.map(z => ({
            zone_id: z.id,
            zone_name: z.name,
            current: z.current_occupancy || 0,
            max: z.max_occupancy || 100,
            percentage: Math.round(((z.current_occupancy || 0) / (z.max_occupancy || 100)) * 100)
        }));
    }

    private loadCards(): void {
        this.loading = true;

        setTimeout(() => {
            this.cards = [
                {
                    id: 1, card_number: 'AC-2025-0001', employee_id: 1, employee_name: 'Иванов Иван Иванович',
                    employee_code: 'EMP-001', department_name: 'IT-отдел', position_name: 'Senior Developer',
                    status: 'active', issued_at: '2025-01-10', valid_from: '2025-01-10', valid_until: '2026-01-10',
                    access_zones: [1, 2, 3, 4], last_used_at: '2025-01-24T08:45:00', last_zone: 'Главный вход'
                },
                {
                    id: 2, card_number: 'AC-2025-0002', employee_id: 2, employee_name: 'Петрова Анна Сергеевна',
                    employee_code: 'EMP-002', department_name: 'IT-отдел', position_name: 'Frontend Developer',
                    status: 'active', issued_at: '2025-01-10', valid_from: '2025-01-10', valid_until: '2026-01-10',
                    access_zones: [1, 2, 4], last_used_at: '2025-01-24T09:12:00', last_zone: 'Офисные помещения'
                },
                {
                    id: 3, card_number: 'AC-2025-0003', employee_id: 3, employee_name: 'Сидоров Пётр Николаевич',
                    employee_code: 'EMP-003', department_name: 'Бухгалтерия', position_name: 'Главный бухгалтер',
                    status: 'active', issued_at: '2025-01-10', valid_from: '2025-01-10', valid_until: '2026-01-10',
                    access_zones: [1, 2, 4, 6], last_used_at: '2025-01-24T08:30:00', last_zone: 'Главный вход'
                },
                {
                    id: 4, card_number: 'AC-2024-0045', employee_id: 4, employee_name: 'Козлова Мария Александровна',
                    employee_code: 'EMP-004', department_name: 'HR-отдел', position_name: 'HR-менеджер',
                    status: 'expired', issued_at: '2024-01-15', valid_from: '2024-01-15', valid_until: '2025-01-15',
                    access_zones: [1, 2, 4], last_used_at: '2025-01-15T18:00:00', last_zone: 'Главный вход'
                },
                {
                    id: 5, card_number: 'AC-2025-0005', employee_id: 5, employee_name: 'Новиков Алексей Дмитриевич',
                    employee_code: 'EMP-005', department_name: 'Юридический отдел', position_name: 'Юрист',
                    status: 'blocked', issued_at: '2025-01-10', valid_from: '2025-01-10', valid_until: '2026-01-10',
                    access_zones: [1, 2], notes: 'Заблокирована по запросу СБ'
                }
            ];
            this.loading = false;
        }, 500);
    }

    loadLogs(): void {
        const now = new Date();
        this.logs = [
            { id: 1, timestamp: this.subtractMinutes(now, 5), card_id: 1, card_number: 'AC-2025-0001', employee_id: 1, employee_name: 'Иванов И.И.', zone_id: 2, zone_name: 'Офисные помещения', reader_id: 1, reader_name: 'Турникет 2-1', direction: 'entry', status: 'granted' },
            { id: 2, timestamp: this.subtractMinutes(now, 12), card_id: 2, card_number: 'AC-2025-0002', employee_id: 2, employee_name: 'Петрова А.С.', zone_id: 1, zone_name: 'Главный вход', reader_id: 1, reader_name: 'Турникет 1-1', direction: 'entry', status: 'granted' },
            { id: 3, timestamp: this.subtractMinutes(now, 18), card_id: 5, card_number: 'AC-2025-0005', employee_id: 5, employee_name: 'Новиков А.Д.', zone_id: 1, zone_name: 'Главный вход', reader_id: 1, reader_name: 'Турникет 1-2', direction: 'entry', status: 'denied', denial_reason: 'Карта заблокирована' },
            { id: 4, timestamp: this.subtractMinutes(now, 25), card_id: 3, card_number: 'AC-2025-0003', employee_id: 3, employee_name: 'Сидоров П.Н.', zone_id: 1, zone_name: 'Главный вход', reader_id: 1, reader_name: 'Турникет 1-1', direction: 'entry', status: 'granted' },
            { id: 5, timestamp: this.subtractMinutes(now, 45), card_id: 1, card_number: 'AC-2025-0001', employee_id: 1, employee_name: 'Иванов И.И.', zone_id: 3, zone_name: 'Серверная', reader_id: 3, reader_name: 'Дверь SERVER-1', direction: 'entry', status: 'granted' },
            { id: 6, timestamp: this.subtractMinutes(now, 60), card_id: 1, card_number: 'AC-2025-0001', employee_id: 1, employee_name: 'Иванов И.И.', zone_id: 3, zone_name: 'Серверная', reader_id: 3, reader_name: 'Дверь SERVER-1', direction: 'exit', status: 'granted' },
            { id: 7, timestamp: this.subtractMinutes(now, 90), card_id: 2, card_number: 'AC-2025-0002', employee_id: 2, employee_name: 'Петрова А.С.', zone_id: 3, zone_name: 'Серверная', reader_id: 3, reader_name: 'Дверь SERVER-1', direction: 'entry', status: 'denied', denial_reason: 'Нет доступа к зоне' }
        ];
    }

    private loadRequests(): void {
        this.requests = [
            {
                id: 1, employee_id: 2, employee_name: 'Петрова Анна Сергеевна', department_name: 'IT-отдел',
                requested_zones: [3], requested_zone_names: ['Серверная'], reason: 'Для обслуживания серверов frontend',
                valid_from: '2025-01-25', valid_until: '2025-02-25', is_temporary: true,
                status: 'pending', requested_at: '2025-01-23T14:00:00'
            },
            {
                id: 2, employee_id: 5, employee_name: 'Новиков Алексей Дмитриевич', department_name: 'Юридический отдел',
                requested_zones: [6], requested_zone_names: ['Руководство'], reason: 'Для работы с документами руководства',
                valid_from: '2025-01-24', is_temporary: false,
                status: 'pending', requested_at: '2025-01-22T10:30:00'
            }
        ];
    }

    private calculateStats(): void {
        this.stats = {
            total_cards: this.cards.length,
            active_cards: this.cards.filter(c => c.status === 'active').length,
            blocked_cards: this.cards.filter(c => c.status === 'blocked').length,
            expired_cards: this.cards.filter(c => c.status === 'expired').length,
            total_zones: this.zones.length,
            entries_today: this.logs.filter(l => l.direction === 'entry' && l.status === 'granted').length,
            exits_today: this.logs.filter(l => l.direction === 'exit' && l.status === 'granted').length,
            current_on_site: this.zones.reduce((sum, z) => sum + (z.current_occupancy || 0), 0),
            denied_today: this.logs.filter(l => l.status === 'denied').length,
            pending_requests: this.requests.filter(r => r.status === 'pending').length
        };
    }

    private subtractMinutes(date: Date, minutes: number): string {
        return new Date(date.getTime() - minutes * 60000).toISOString();
    }

    // Filtering
    get filteredCards(): AccessCard[] {
        return this.cards.filter(card => {
            if (this.searchQuery) {
                const query = this.searchQuery.toLowerCase();
                const matches = card.employee_name.toLowerCase().includes(query) ||
                    card.card_number.toLowerCase().includes(query) ||
                    card.employee_code.toLowerCase().includes(query);
                if (!matches) return false;
            }
            if (this.selectedCardStatus && card.status !== this.selectedCardStatus) return false;
            if (this.selectedZone && !card.access_zones.includes(this.selectedZone)) return false;
            return true;
        });
    }

    get filteredLogs(): AccessLog[] {
        return this.logs.filter(log => {
            if (this.selectedLogStatus && log.status !== this.selectedLogStatus) return false;
            if (this.selectedZone && log.zone_id !== this.selectedZone) return false;
            return true;
        });
    }

    clearFilters(): void {
        this.searchQuery = '';
        this.selectedCardStatus = null;
        this.selectedZone = null;
        this.selectedLogStatus = null;
    }

    // Card management
    openNewCardDialog(): void {
        this.isEditMode = false;
        this.cardForm = {
            status: 'active',
            valid_from: new Date().toISOString().split('T')[0],
            valid_until: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        };
        this.selectedZonesForCard = [1]; // Default: main entrance
        this.displayCardDialog = true;
    }

    openEditCardDialog(card: AccessCard): void {
        this.isEditMode = true;
        this.selectedCard = card;
        this.cardForm = { ...card };
        this.selectedZonesForCard = [...card.access_zones];
        this.displayCardDialog = true;
    }

    saveCard(): void {
        if (!this.cardForm.employee_id) {
            this.messageService.add({ severity: 'error', summary: 'Ошибка', detail: 'Выберите сотрудника' });
            return;
        }

        const employee = this.employees.find(e => e.id === this.cardForm.employee_id);

        if (this.isEditMode && this.selectedCard) {
            const index = this.cards.findIndex(c => c.id === this.selectedCard!.id);
            if (index !== -1) {
                this.cards[index] = {
                    ...this.cards[index],
                    ...this.cardForm,
                    access_zones: this.selectedZonesForCard
                } as AccessCard;
            }
            this.messageService.add({ severity: 'success', summary: 'Сохранено', detail: 'Карта обновлена' });
        } else {
            const newCard: AccessCard = {
                id: Math.max(...this.cards.map(c => c.id)) + 1,
                card_number: this.generateCardNumber(),
                employee_id: this.cardForm.employee_id!,
                employee_name: employee?.name || '',
                employee_code: `EMP-${String(this.cardForm.employee_id).padStart(3, '0')}`,
                department_name: employee?.department || '',
                position_name: employee?.position || '',
                status: 'active',
                issued_at: new Date().toISOString().split('T')[0],
                valid_from: this.cardForm.valid_from || new Date().toISOString().split('T')[0],
                valid_until: this.cardForm.valid_until || '',
                access_zones: this.selectedZonesForCard
            };
            this.cards.unshift(newCard);
            this.messageService.add({ severity: 'success', summary: 'Создано', detail: 'Карта выдана' });
        }

        this.displayCardDialog = false;
        this.calculateStats();
    }

    private generateCardNumber(): string {
        const year = new Date().getFullYear();
        const num = String(this.cards.length + 1).padStart(4, '0');
        return `AC-${year}-${num}`;
    }

    // Block/Unblock card
    openBlockDialog(card: AccessCard): void {
        this.selectedCard = card;
        this.blockReason = '';
        this.displayBlockDialog = true;
    }

    blockCard(): void {
        if (!this.selectedCard) return;

        this.selectedCard.status = 'blocked';
        this.selectedCard.notes = this.blockReason || 'Заблокирована администратором';

        this.messageService.add({ severity: 'warn', summary: 'Заблокировано', detail: 'Карта заблокирована' });
        this.displayBlockDialog = false;
        this.calculateStats();
    }

    unblockCard(card: AccessCard): void {
        this.confirmationService.confirm({
            message: `Разблокировать карту ${card.card_number}?`,
            header: 'Подтверждение',
            icon: 'pi pi-question-circle',
            acceptLabel: 'Да',
            rejectLabel: 'Нет',
            accept: () => {
                card.status = 'active';
                card.notes = undefined;
                this.messageService.add({ severity: 'success', summary: 'Разблокировано', detail: 'Карта разблокирована' });
                this.calculateStats();
            }
        });
    }

    // Requests
    openRequestDialog(request: AccessRequest): void {
        this.selectedRequest = request;
        this.rejectionReason = '';
        this.displayRequestDialog = true;
    }

    approveRequest(): void {
        if (!this.selectedRequest) return;

        this.selectedRequest.status = 'approved';
        this.selectedRequest.processed_at = new Date().toISOString();
        this.selectedRequest.processed_by_name = 'Администратор';

        // Add zones to employee's card
        const card = this.cards.find(c => c.employee_id === this.selectedRequest!.employee_id);
        if (card) {
            this.selectedRequest.requested_zones.forEach(zoneId => {
                if (!card.access_zones.includes(zoneId)) {
                    card.access_zones.push(zoneId);
                }
            });
        }

        this.messageService.add({ severity: 'success', summary: 'Одобрено', detail: 'Заявка одобрена, доступ предоставлен' });
        this.displayRequestDialog = false;
        this.calculateStats();
    }

    rejectRequest(): void {
        if (!this.selectedRequest) return;

        this.selectedRequest.status = 'rejected';
        this.selectedRequest.processed_at = new Date().toISOString();
        this.selectedRequest.processed_by_name = 'Администратор';
        this.selectedRequest.rejection_reason = this.rejectionReason;

        this.messageService.add({ severity: 'warn', summary: 'Отклонено', detail: 'Заявка отклонена' });
        this.displayRequestDialog = false;
        this.calculateStats();
    }

    // Helpers
    getCardStatusLabel(status: CardStatus): string {
        return this.cardStatuses.find(s => s.value === status)?.label || status;
    }

    getCardStatusSeverity(status: CardStatus): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
        const found = this.cardStatuses.find(s => s.value === status);
        return (found?.severity as any) || 'secondary';
    }

    getSecurityLevelLabel(level: SecurityLevel): string {
        return this.securityLevels.find(l => l.value === level)?.label || level;
    }

    getSecurityLevelColor(level: SecurityLevel): string {
        return this.securityLevels.find(l => l.value === level)?.color || 'gray';
    }

    getAccessStatusLabel(status: AccessEventStatus): string {
        return this.accessEventStatuses.find(s => s.value === status)?.label || status;
    }

    getAccessStatusSeverity(status: AccessEventStatus): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
        const found = this.accessEventStatuses.find(s => s.value === status);
        return (found?.severity as any) || 'secondary';
    }

    getRequestStatusLabel(status: RequestStatus): string {
        return this.requestStatuses.find(s => s.value === status)?.label || status;
    }

    getRequestStatusSeverity(status: RequestStatus): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
        const found = this.requestStatuses.find(s => s.value === status);
        return (found?.severity as any) || 'secondary';
    }

    getZoneName(zoneId: number): string {
        return this.zones.find(z => z.id === zoneId)?.name || '';
    }

    getZoneNames(zoneIds: number[]): string {
        return zoneIds.map(id => this.getZoneName(id)).join(', ');
    }

    formatDateTime(dateStr: string): string {
        return new Date(dateStr).toLocaleString('ru-RU');
    }

    formatDate(dateStr: string): string {
        return new Date(dateStr).toLocaleDateString('ru-RU');
    }

    formatTime(dateStr: string): string {
        return new Date(dateStr).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    }

    getOccupancyColor(percentage: number): string {
        if (percentage < 50) return 'green';
        if (percentage < 80) return 'orange';
        return 'red';
    }

    isZoneSelected(zoneId: number): boolean {
        return this.selectedZonesForCard.includes(zoneId);
    }

    toggleZoneSelection(zoneId: number): void {
        const index = this.selectedZonesForCard.indexOf(zoneId);
        if (index > -1) {
            this.selectedZonesForCard.splice(index, 1);
        } else {
            this.selectedZonesForCard.push(zoneId);
        }
    }

    onTabChange(event: any): void {
        this.activeTabIndex = event.index;
    }
}
