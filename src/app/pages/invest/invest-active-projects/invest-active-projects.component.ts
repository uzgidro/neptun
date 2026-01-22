import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { MessageService } from 'primeng/api';
import { InvestActiveProjectService } from '@/core/services/invest-active-project.service';
import { InvestActiveProject } from '@/core/interfaces/invest-active-project';
import { FormsModule } from '@angular/forms';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import { ButtonDirective, ButtonIcon, ButtonLabel } from 'primeng/button';
import { Tooltip } from 'primeng/tooltip';
import { Tabs, TabList, Tab, TabPanels, TabPanel } from 'primeng/tabs';
import { InvestProjectDialogComponent } from './invest-project-dialog/invest-project-dialog.component';
import { AuthService } from '@/core/services/auth.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-invest-active-projects',
    standalone: true,
    imports: [CommonModule, TableModule, FormsModule, IconField, InputIcon, InputText, ButtonDirective, Tooltip, Tabs, TabList, Tab, TabPanels, TabPanel, InvestProjectDialogComponent, ButtonLabel, ButtonIcon, TranslateModule],
    templateUrl: './invest-active-projects.component.html',
    styleUrl: './invest-active-projects.component.scss'
})
export class InvestActiveProjectsComponent implements OnInit {
    projects: InvestActiveProject[] = [];
    projectsByCategory: { [key: string]: InvestActiveProject[] } = {};
    categories: string[] = [];
    loading = false;
    searchValue: string = '';

    // Диалоги
    showProjectDialog = false;
    projectToEdit: InvestActiveProject | null = null;

    private projectService = inject(InvestActiveProjectService);
    private messageService = inject(MessageService);
    private authService = inject(AuthService);
    private translateService = inject(TranslateService);

    get canEdit(): boolean {
        return this.authService.hasRole('investment');
    }

    ngOnInit(): void {
        this.loadProjects();
    }

    loadProjects(): void {
        this.loading = true;
        this.projectService.getActiveProjects().subscribe({
            next: (data) => {
                this.projects = data;
                this.groupByCategory();
                this.loading = false;
            },
            error: (err) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Ошибка загрузки',
                    detail: 'Не удалось загрузить активные проекты'
                });
                console.error(err);
                this.loading = false;
            }
        });
    }

    groupByCategory(): void {
        this.projectsByCategory = {};
        this.projects.forEach((project) => {
            if (!this.projectsByCategory[project.category]) {
                this.projectsByCategory[project.category] = [];
            }
            this.projectsByCategory[project.category].push(project);
        });
        this.categories = Object.keys(this.projectsByCategory).sort();
    }

    clear(table: any) {
        table.clear();
        this.searchValue = '';
    }

    getProjectsForCategory(category: string): InvestActiveProject[] {
        return this.projectsByCategory[category] || [];
    }

    openAddDialog(): void {
        this.projectToEdit = null;
        this.showProjectDialog = true;
    }

    openEditDialog(project: InvestActiveProject): void {
        this.projectToEdit = project;
        this.showProjectDialog = true;
    }

    confirmDelete(project: InvestActiveProject): void {
        if (confirm('Вы уверены, что хотите удалить этот проект?')) {
            this.deleteProject(project.id);
        }
    }

    deleteProject(id: number): void {
        this.projectService.delete(id).subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Успешно',
                    detail: 'Проект успешно удален'
                });
                this.loadProjects();
            },
            error: (err) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Ошибка удаления',
                    detail: err.error?.message || 'Не удалось удалить проект'
                });
            }
        });
    }
}
