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



// Интерфейс для данных нашей таблицы
export interface StudentData {
    id: number;
    group: string; // Поле для группировки
    school: string;
    student: string;
    class: string;
    age: number | null;
}

@Component({
    selector: 'app-excel',
    standalone: true,
    imports: [CommonModule, InputTextModule, FormsModule, ButtonModule, DialogModule, ConfirmDialogModule, ToastModule, ReactiveFormsModule, TableModule, Select],
    templateUrl: './excel.component.html',
    providers: [ConfirmationService, MessageService] // Добавляем сервисы для диалогов и уведомлений
})
class ExcelComponent implements OnInit {
    private apiService = inject(ApiService);
    allStudents: StudentData[] = [];
    allStudents2: StudentData[] = [];
    allStudents3: StudentData[] = []; // Данные для третьей таблицы
    groups: { name: string }[] = [];

    newStudent: Partial<StudentData> = { group: '', school: '', student: '', class: '', age: null };
    newStudent2: Partial<StudentData> = { group: '', school: '', student: '', class: '', age: null };
    newStudent3: Partial<StudentData> = { group: '', school: '', student: '', class: '', age: null }; // Данные для формы третьей таблицы
    displayAddDialog = false;
    displayAddDialog2 = false;
    displayAddDialog3 = false; // Управление диалогом для третьей таблицы

    constructor(
        private confirmationService: ConfirmationService,
        private messageService: MessageService
    ) {}

    ngOnInit() {
        this.apiService.getCascades().subscribe({
            next: data => {
                console.log(data);
            }
        })
        // Исходные данные, разделенные по группам
        const initialTables = [
            {
                title: 'Общеобразовательные школы',
                data: [
                    { id: 1, school: 'Школа №17', student: 'Иванов Иван', class: '9А', age: 15 },
                    { id: 2, school: 'Лицей "Интеллект"', student: 'Петрова Мария', class: '10Б', age: 16 }
                ]
            },
            { title: 'Специализированные школы', data: [{ id: 1, school: 'Музыкальная школа', student: 'Бахов Себастьян', class: 'Сольфеджио', age: 14 }] },
            { title: 'Спортивные секции', data: [] },
            { title: 'Художественные кружки', data: [] },
            { title: 'Научные лаборатории', data: [] },
            { title: 'Волонтерские движения', data: [] }
        ];

        // Формируем единый массив данных и список групп
        // this.allStudents = initialTables.flatMap((table) => table.data.map((student) => ({ ...student, group: table.title })));

        // Инициализируем данные для второй таблицы (можно использовать другие данные)
        // this.allStudents2 = [
        //     { id: 101, group: 'Спортивные секции', school: 'Спортивная школа "Олимп"', student: 'Борисов Борис', class: 'Дзюдо', age: 16 },
        //     { id: 102, group: 'Художественные кружки', school: 'Арт-студия "Палитра"', student: 'Александрова Александра', class: 'Живопись', age: 14 }
        // ];

        // Инициализируем данные для третьей таблицы (можно использовать другие данные)
        // this.allStudents3 = [
        //     { id: 201, group: 'Научные лаборатории', school: 'Кванториум', student: 'Николаев Николай', class: 'Робототехника', age: 15 },
        // ];

        this.groups = initialTables.map((table) => ({ name: table.title }));
    }

    showAddDialog() {
        this.newStudent = { group: this.groups[0]?.name, school: '', student: '', class: '', age: null }; // Сбрасываем форму
        this.displayAddDialog = true;
    }

    showAddDialog2() {
        this.newStudent2 = { group: this.groups[0]?.name, school: '', student: '', class: '', age: null }; // Сбрасываем форму для второй таблицы
        this.displayAddDialog2 = true;
    }

    showAddDialog3() {
        this.newStudent3 = { group: this.groups[0]?.name, school: '', student: '', class: '', age: null }; // Сбрасываем форму для третьей таблицы
        this.displayAddDialog3 = true;
    }

    saveNewStudent() {
        if (this.newStudent.group && this.newStudent.student && this.newStudent.school) {
            const newId = this.allStudents.length > 0 ? Math.max(...this.allStudents.map((s) => s.id)) + 1 : 1;
            this.allStudents.push({ ...this.newStudent, id: newId } as StudentData);
            this.allStudents = [...this.allStudents]; // Обновляем ссылку для перерисовки таблицы
            this.displayAddDialog = false;
            this.messageService.add({ severity: 'success', summary: 'Успешно', detail: 'Ученик добавлен' });
        }
    }

    saveNewStudent2() {
        if (this.newStudent2.group && this.newStudent2.student && this.newStudent2.school) {
            const newId = this.allStudents2.length > 0 ? Math.max(...this.allStudents2.map((s) => s.id)) + 1 : 1;
            this.allStudents2.push({ ...this.newStudent2, id: newId } as StudentData);
            this.allStudents2 = [...this.allStudents2];
            this.displayAddDialog2 = false;
            this.messageService.add({ severity: 'success', summary: 'Успешно', detail: 'Ученик добавлен во вторую таблицу' });
        }
    }

    saveNewStudent3() {
        if (this.newStudent3.group && this.newStudent3.student && this.newStudent3.school) {
            const newId = this.allStudents3.length > 0 ? Math.max(...this.allStudents3.map((s) => s.id)) + 1 : 1;
            this.allStudents3.push({ ...this.newStudent3, id: newId } as StudentData);
            this.allStudents3 = [...this.allStudents3];
            this.displayAddDialog3 = false;
            this.messageService.add({ severity: 'success', summary: 'Успешно', detail: 'Ученик добавлен в третью таблицу' });
        }
    }

    deleteStudent(student: StudentData) {
        this.confirmationService.confirm({
            message: `Вы уверены, что хотите удалить ученика ${student.student}?`,
            header: 'Подтверждение удаления',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.allStudents = this.allStudents.filter((s) => s.id !== student.id);
                this.messageService.add({ severity: 'info', summary: 'Успешно', detail: 'Ученик удален' });
            }
        });
    }

    deleteStudent2(student: StudentData) {
        this.confirmationService.confirm({
            message: `Вы уверены, что хотите удалить ученика ${student.student} из второй таблицы?`,
            header: 'Подтверждение удаления',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.allStudents2 = this.allStudents2.filter((s) => s.id !== student.id);
                this.messageService.add({ severity: 'info', summary: 'Успешно', detail: 'Ученик удален из второй таблицы' });
            }
        });
    }

    deleteStudent3(student: StudentData) {
        this.confirmationService.confirm({
            message: `Вы уверены, что хотите удалить ученика ${student.student} из третьей таблицы?`,
            header: 'Подтверждение удаления',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.allStudents3 = this.allStudents3.filter((s) => s.id !== student.id);
                this.messageService.add({ severity: 'info', summary: 'Успешно', detail: 'Ученик удален из третьей таблицы' });
            }
        });
    }

    exportCombinedToExcel(): void {
        const title = 'Общий сводный список учеников';
        // 1. Объединяем данные из обеих таблиц в один массив
        const combinedData = [...this.allStudents, ...this.allStudents2, ...this.allStudents3];

        if (combinedData.length === 0) {
            this.messageService.add({ severity: 'warn', summary: 'Нечего экспортировать', detail: 'Таблицы пусты' });
            return;
        }

        // Убираем ID и группу для чистоты экспорта
        const dataToExport = combinedData.map(({ id, group, ...rest }) => ({
            Группа: group, // Добавляем русское название колонки
            Школа: rest.school,
            Ученик: rest.student,
            Класс: rest.class,
            Возраст: rest.age
        }));

        const workbook: XLSX.WorkBook = XLSX.utils.book_new();
        const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet([]);

        // 2. Добавляем стилизованный заголовок
        XLSX.utils.sheet_add_aoa(worksheet, [[{ v: title, t: 's', s: { font: { bold: true, sz: 16, color: { rgb: 'FFFFFF' } }, fill: { fgColor: { rgb: '4F81BD' } } } }]], { origin: 'A1' });
        worksheet['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 4 } }]; // Объединяем ячейки для заголовка

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

        XLSX.utils.book_append_sheet(workbook, worksheet, 'Общий список');

        const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        this.saveAsExcelFile(excelBuffer, 'combined_students_list');
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

export default ExcelComponent;
