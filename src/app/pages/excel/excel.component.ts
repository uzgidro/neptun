import { Component, inject, OnInit } from '@angular/core';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import * as XLSX from 'xlsx';
import { TableModule } from 'primeng/table';
import { Select } from 'primeng/select';
import { ApiService } from '@/core/services/api.service';
import { Organization } from '@/core/interfaces/organizations';
import { DatePicker } from 'primeng/datepicker';



// Интерфейс для данных нашей таблицы
export interface ShutdownData {
    id: number;
    organization: string;
    event_date: string;
    recovery_date: string;
    description: string;
    lost_power: number;
    idle_discharge: number;
}

@Component({
    selector: 'app-excel',
    standalone: true,
    imports: [CommonModule, InputTextModule, FormsModule, ButtonModule, DialogModule, ConfirmDialogModule, ToastModule, ReactiveFormsModule, TableModule, Select, DatePicker],
    templateUrl: './excel.component.html',
    providers: [ConfirmationService, MessageService] // Добавляем сервисы для диалогов и уведомлений
})
export class ExcelComponent implements OnInit {
    private apiService = inject(ApiService);
    shutdowns: ShutdownData[] = []; // Данные для таблицы

    organizations: Organization[] = [];

    newEntry: Partial<ShutdownData> = {}; // Данные для формы
    displayAddDialog = false; // Управление диалогом

    constructor(
        private confirmationService: ConfirmationService,
        private messageService: MessageService
    ) {}

    ngOnInit() {
        this.apiService.getCascades().subscribe({
            next: (data) => {
                this.organizations = data;
            }
        });
        // Исходные данные, разделенные по группам
        // Инициализируем данные для третьей таблицы (можно использовать другие данные)
        // this.shutdowns = [
        //    { id: 1, organization: 'Андижон ГЭСлар каскади', event_date: '2024-05-20 10:00', recovery_date: '2024-05-20 12:30', description: 'Краткое замыкание', lost_power: 50, idle_discharge: 120 },
        //   { id: 2, organization: 'Чорвоқ ГЭС', event_date: '2024-05-21 14:15', recovery_date: '2024-05-21 15:00', description: 'Плановое отключение', lost_power: 0, idle_discharge: 0 }
        // ];
    }

    showAddDialog() {
        this.newEntry = {}; // Сбрасываем форму
        this.displayAddDialog = true;
    }

    saveNewEntry() {
        if (this.newEntry.organization && this.newEntry.description) {
            const newId = this.shutdowns.length > 0 ? Math.max(...this.shutdowns.map((s) => s.id)) + 1 : 1;
            this.shutdowns.push({ ...this.newEntry, id: newId } as ShutdownData);
            this.shutdowns = [...this.shutdowns]; // Обновляем ссылку для перерисовки таблицы
            this.displayAddDialog = false;
            this.messageService.add({ severity: 'success', summary: 'Успешно', detail: 'Запись добавлена' });
        }
    }

    deleteEntry(entry: ShutdownData) {
        this.confirmationService.confirm({
            message: `Вы уверены, что хотите удалить запись №${entry.id}?`,
            header: 'Подтверждение удаления',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.shutdowns = this.shutdowns.filter((s) => s.id !== entry.id);
                this.messageService.add({ severity: 'info', summary: 'Успешно', detail: 'Запись удалена' });
            }
        });
    }

    exportToExcel(): void {
        const title = 'Информация об аварийных отключениях';
        const combinedData = this.shutdowns;

        if (combinedData.length === 0) {
            this.messageService.add({ severity: 'warn', summary: 'Нечего экспортировать', detail: 'Таблицы пусты' });
            return;
        }

        // Убираем ID и группу для чистоты экспорта
        const dataToExport = combinedData.map(({ id, ...rest }) => ({
            'Наименование объекта': rest.organization,
            'Дата и время происшествия': rest.event_date,
            'Дата и время восстановления': rest.recovery_date,
            'Короткое описание аварии': rest.description,
            'Непроизведенная электроэнергия (тыс. кВт*ч)': rest.lost_power,
            'Количество холостого сброса воды (тыс. м3)': rest.idle_discharge
        }));

        const workbook: XLSX.WorkBook = XLSX.utils.book_new();
        const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet([]);

        // 2. Добавляем стилизованный заголовок
        XLSX.utils.sheet_add_aoa(worksheet, [[{ v: title, t: 's', s: { font: { bold: true, sz: 16, color: { rgb: 'FFFFFF' } }, fill: { fgColor: { rgb: '4F81BD' } } } }]], { origin: 'A1' });
        worksheet['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 6 } }]; // Объединяем ячейки для заголовка

        // 3. Добавляем данные таблицы со стилизованной шапкой
        XLSX.utils.sheet_add_json(worksheet, dataToExport, { origin: 'A3', skipHeader: false });
        const header = Object.keys(dataToExport[0] || {});
        for (let i = 0; i < header.length; i++) {
            const cellRef = XLSX.utils.encode_cell({ c: i, r: 2 });
            if (worksheet[cellRef]) {
                worksheet[cellRef].s = { font: { bold: true, color: { rgb: 'FFFFFF' } }, fill: { fgColor: { rgb: '4F81BD' } } };
            }
        }

        // 4. Автоматически подбираем ширину колонок
        const colWidths = header.map((key) => ({
            wch: Math.max(key.length, ...dataToExport.map((row) => (row[key as keyof typeof row] ? row[key as keyof typeof row]!.toString().length : 0))) + 2 // Добавляем небольшой запас
        }));
        worksheet['!cols'] = colWidths;

        XLSX.utils.book_append_sheet(workbook, worksheet, 'Аварийные отключения');

        const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        this.saveAsExcelFile(excelBuffer, 'shutdowns_report');
    }

    private saveAsExcelFile(buffer: any, fileName: string): void {
        const data: Blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
        const downloadLink = document.createElement('a');
        downloadLink.href = window.URL.createObjectURL(data);
        downloadLink.download = `${fileName}_${new Date().getTime()}.xlsx`;
        downloadLink.click();
    }

    onSort() {
        // Этот метод необходим для события сортировки в p-table.
        // В данном случае дополнительная логика не требуется.
    }
}
