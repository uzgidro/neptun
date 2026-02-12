import { Injectable } from '@angular/core';
import { ApiService } from '@/core/services/api.service';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { GoalPayload, PerformanceGoal, PerformanceReview, PerformanceReviewPayload } from '@/core/interfaces/hrm/performance';

// Мок-данные целей (15 целей)
const MOCK_GOALS: PerformanceGoal[] = [
    {
        id: 1,
        review_id: 1,
        employee_id: 1,
        employee_name: 'Каримов Рустам Шарипович',
        title: 'Увеличение выручки компании',
        description: 'Обеспечить рост выручки предприятия на 15% по сравнению с предыдущим годом',
        metric: 'Выручка (млрд UZS)',
        target_value: '50',
        actual_value: '52.5',
        weight: 30,
        start_date: '2024-01-01',
        due_date: '2024-12-31',
        status: 'exceeded',
        progress_percent: 105,
        rating: 5,
        comments: 'Перевыполнение плана на 5%',
        created_at: '2024-01-05',
        updated_at: '2024-12-31'
    },
    {
        id: 2,
        review_id: 1,
        employee_id: 1,
        employee_name: 'Каримов Рустам Шарипович',
        title: 'Снижение производственных издержек',
        description: 'Снизить производственные издержки на 10% за счёт оптимизации процессов',
        metric: 'Сокращение издержек (%)',
        target_value: '10',
        actual_value: '8',
        weight: 25,
        start_date: '2024-01-01',
        due_date: '2024-12-31',
        status: 'completed',
        progress_percent: 80,
        rating: 3,
        comments: 'Достигнуто снижение на 8%, частично из-за роста цен на сырьё',
        created_at: '2024-01-05',
        updated_at: '2024-12-31'
    },
    {
        id: 3,
        review_id: 2,
        employee_id: 2,
        employee_name: 'Ахмедова Нилуфар Бахтиёровна',
        title: 'Снижение текучести кадров',
        description: 'Снизить текучесть кадров до уровня не более 8% в год',
        metric: 'Текучесть (%)',
        target_value: '8',
        actual_value: '7.2',
        weight: 35,
        start_date: '2024-01-01',
        due_date: '2024-12-31',
        status: 'exceeded',
        progress_percent: 110,
        rating: 5,
        comments: 'Целевой показатель перевыполнен',
        created_at: '2024-01-05',
        updated_at: '2024-12-31'
    },
    {
        id: 4,
        review_id: 2,
        employee_id: 2,
        employee_name: 'Ахмедова Нилуфар Бахтиёровна',
        title: 'Внедрение HRM-системы',
        description: 'Внедрить автоматизированную систему управления персоналом',
        metric: 'Этапы внедрения',
        target_value: '4',
        actual_value: '4',
        weight: 30,
        start_date: '2024-01-01',
        due_date: '2024-12-31',
        status: 'completed',
        progress_percent: 100,
        rating: 4,
        comments: 'Все 4 этапа завершены в срок',
        created_at: '2024-01-05',
        updated_at: '2024-12-31'
    },
    {
        id: 5,
        review_id: 3,
        employee_id: 3,
        employee_name: 'Юлдашев Ботир Камолович',
        title: 'Выполнение плана производства',
        description: 'Обеспечить выполнение плана производства на 100%',
        metric: 'Выполнение плана (%)',
        target_value: '100',
        actual_value: '98',
        weight: 40,
        start_date: '2024-01-01',
        due_date: '2024-12-31',
        status: 'completed',
        progress_percent: 98,
        rating: 4,
        comments: 'Незначительное отклонение из-за плановых ремонтов в Q3',
        created_at: '2024-01-05',
        updated_at: '2024-12-31'
    },
    {
        id: 6,
        review_id: 3,
        employee_id: 3,
        employee_name: 'Юлдашев Ботир Камолович',
        title: 'Снижение процента брака',
        description: 'Снизить процент брака на производстве до 1.5%',
        metric: 'Процент брака (%)',
        target_value: '1.5',
        actual_value: '1.8',
        weight: 30,
        start_date: '2024-07-01',
        due_date: '2024-12-31',
        status: 'completed',
        progress_percent: 80,
        rating: 3,
        comments: 'Снижение есть, но целевой показатель не достигнут',
        created_at: '2024-07-01',
        updated_at: '2024-12-31'
    },
    {
        id: 7,
        review_id: 4,
        employee_id: 4,
        employee_name: 'Рахимова Дилноза Алишеровна',
        title: 'Своевременная сдача отчётности',
        description: 'Обеспечить 100% своевременную сдачу налоговой и бухгалтерской отчётности',
        metric: 'Своевременность (%)',
        target_value: '100',
        actual_value: '100',
        weight: 40,
        start_date: '2024-07-01',
        due_date: '2024-12-31',
        status: 'completed',
        progress_percent: 100,
        rating: 5,
        comments: 'Вся отчётность сдана без нарушений сроков',
        created_at: '2024-07-01',
        updated_at: '2024-12-31'
    },
    {
        id: 8,
        review_id: 5,
        employee_id: 5,
        employee_name: 'Назаров Фаррух Бахромович',
        title: 'Обеспечение uptime серверов',
        description: 'Обеспечить доступность серверной инфраструктуры не менее 99.5%',
        metric: 'Uptime (%)',
        target_value: '99.5',
        actual_value: '99.1',
        weight: 35,
        start_date: '2025-01-01',
        due_date: '2025-06-30',
        status: 'in_progress',
        progress_percent: 60,
        rating: 3,
        comments: 'Один незапланированный простой в январе',
        created_at: '2025-01-05',
        updated_at: '2025-02-05'
    },
    {
        id: 9,
        review_id: 5,
        employee_id: 5,
        employee_name: 'Назаров Фаррух Бахромович',
        title: 'Миграция на новый почтовый сервер',
        description: 'Выполнить миграцию корпоративной почты на новый сервер без потери данных',
        metric: 'Этапы миграции',
        target_value: '5',
        actual_value: '3',
        weight: 25,
        start_date: '2025-01-01',
        due_date: '2025-04-30',
        status: 'in_progress',
        progress_percent: 60,
        created_at: '2025-01-05',
        updated_at: '2025-02-05'
    },
    {
        id: 10,
        review_id: 6,
        employee_id: 8,
        employee_name: 'Исмоилова Шахло Равшановна',
        title: 'Разработка процедур контроля качества',
        description: 'Разработать и внедрить 5 новых процедур контроля качества в соответствии с ISO 9001',
        metric: 'Количество процедур',
        target_value: '5',
        weight: 40,
        start_date: '2025-01-01',
        due_date: '2025-06-30',
        status: 'not_started',
        progress_percent: 0,
        created_at: '2025-02-01',
        updated_at: '2025-02-01'
    },
    {
        id: 11,
        employee_id: 7,
        employee_name: 'Мирзаев Жасур Хамидович',
        title: 'Оптимизация технологического процесса',
        description: 'Оптимизировать 3 ключевых технологических процесса для повышения эффективности',
        metric: 'Процессы оптимизированы',
        target_value: '3',
        actual_value: '1',
        weight: 35,
        start_date: '2025-01-01',
        due_date: '2025-06-30',
        status: 'in_progress',
        progress_percent: 33,
        created_at: '2025-01-05',
        updated_at: '2025-02-01'
    },
    {
        id: 12,
        employee_id: 9,
        employee_name: 'Турсунов Ильхом Адхамович',
        title: 'Снижение логистических затрат',
        description: 'Снизить затраты на логистику на 12% за счёт оптимизации маршрутов',
        metric: 'Сокращение затрат (%)',
        target_value: '12',
        actual_value: '5',
        weight: 30,
        start_date: '2025-01-01',
        due_date: '2025-06-30',
        status: 'in_progress',
        progress_percent: 42,
        created_at: '2025-01-05',
        updated_at: '2025-02-01'
    },
    {
        id: 13,
        employee_id: 10,
        employee_name: 'Хасанова Малика Обидовна',
        title: 'Оцифровка личных дел сотрудников',
        description: 'Перевести все личные дела сотрудников в электронный формат',
        metric: 'Личные дела (%)',
        target_value: '100',
        actual_value: '45',
        weight: 40,
        start_date: '2025-01-01',
        due_date: '2025-06-30',
        status: 'in_progress',
        progress_percent: 45,
        created_at: '2025-01-05',
        updated_at: '2025-02-05'
    },
    {
        id: 14,
        employee_id: 6,
        employee_name: 'Абдуллаева Гулнора Тахировна',
        title: 'Актуализация внутренних нормативных документов',
        description: 'Обновить все внутренние нормативные документы компании в соответствии с текущим законодательством',
        metric: 'Документы обновлены',
        target_value: '15',
        actual_value: '15',
        weight: 35,
        start_date: '2024-07-01',
        due_date: '2024-12-31',
        status: 'completed',
        progress_percent: 100,
        rating: 5,
        comments: 'Все 15 документов актуализированы в срок',
        created_at: '2024-07-01',
        updated_at: '2024-12-31'
    },
    {
        id: 15,
        employee_id: 12,
        employee_name: 'Каримова Зилола Бахтияровна',
        title: 'Автоматизация расчёта себестоимости',
        description: 'Настроить автоматический расчёт себестоимости продукции в 1С',
        metric: 'Этапы автоматизации',
        target_value: '4',
        weight: 30,
        start_date: '2025-01-01',
        due_date: '2025-06-30',
        status: 'not_started',
        progress_percent: 0,
        created_at: '2025-02-01',
        updated_at: '2025-02-01'
    }
];

// Мок-данные обзоров эффективности (6 обзоров: 4 completed + 1 in_progress + 1 draft)
const MOCK_REVIEWS: PerformanceReview[] = [
    {
        id: 1,
        employee_id: 1,
        employee_name: 'Каримов Рустам Шарипович',
        reviewer_id: 1,
        reviewer_name: 'Каримов Рустам Шарипович',
        review_period_start: '2024-01-01',
        review_period_end: '2024-12-31',
        review_type: 'annual',
        status: 'completed',
        overall_rating: 4,
        goals: MOCK_GOALS.filter((g) => g.review_id === 1),
        strengths: 'Стратегическое видение, способность принимать решения в условиях неопределённости, эффективное управление командой',
        areas_for_improvement: 'Делегирование оперативных задач, баланс между стратегией и операционкой',
        reviewer_comments: 'Отличный год для компании. Основные показатели выполнены и перевыполнены.',
        created_at: '2024-12-20',
        updated_at: '2025-01-10'
    },
    {
        id: 2,
        employee_id: 2,
        employee_name: 'Ахмедова Нилуфар Бахтиёровна',
        reviewer_id: 1,
        reviewer_name: 'Каримов Рустам Шарипович',
        review_period_start: '2024-01-01',
        review_period_end: '2024-12-31',
        review_type: 'annual',
        status: 'completed',
        overall_rating: 5,
        goals: MOCK_GOALS.filter((g) => g.review_id === 2),
        strengths: 'Инициативность, системный подход к построению HR-процессов, внимание к деталям',
        areas_for_improvement: 'Развитие навыков публичных выступлений',
        reviewer_comments: 'Выдающиеся результаты. Успешное внедрение HRM-системы и значительное снижение текучести.',
        employee_comments: 'Благодарю за поддержку руководства при внедрении HRM-системы.',
        created_at: '2024-12-22',
        updated_at: '2025-01-12'
    },
    {
        id: 3,
        employee_id: 3,
        employee_name: 'Юлдашев Ботир Камолович',
        reviewer_id: 1,
        reviewer_name: 'Каримов Рустам Шарипович',
        review_period_start: '2024-01-01',
        review_period_end: '2024-12-31',
        review_type: 'annual',
        status: 'completed',
        overall_rating: 4,
        goals: MOCK_GOALS.filter((g) => g.review_id === 3),
        strengths: 'Глубокие технические знания, управление производственным процессом, ответственность',
        areas_for_improvement: 'Снижение процента брака, развитие системы наставничества',
        reviewer_comments: 'Стабильно высокие результаты. Необходимо уделить внимание показателю брака.',
        created_at: '2024-12-25',
        updated_at: '2025-01-14'
    },
    {
        id: 4,
        employee_id: 4,
        employee_name: 'Рахимова Дилноза Алишеровна',
        reviewer_id: 1,
        reviewer_name: 'Каримов Рустам Шарипович',
        review_period_start: '2024-07-01',
        review_period_end: '2024-12-31',
        review_type: 'semi_annual',
        status: 'completed',
        overall_rating: 5,
        goals: MOCK_GOALS.filter((g) => g.review_id === 4),
        strengths: 'Безупречная точность, соблюдение сроков, глубокое знание налогового законодательства',
        areas_for_improvement: 'Автоматизация рутинных процессов',
        reviewer_comments: 'Отличная работа. Ни одного замечания от налоговых органов.',
        created_at: '2025-01-05',
        updated_at: '2025-01-15'
    },
    {
        id: 5,
        employee_id: 5,
        employee_name: 'Назаров Фаррух Бахромович',
        reviewer_id: 1,
        reviewer_name: 'Каримов Рустам Шарипович',
        review_period_start: '2025-01-01',
        review_period_end: '2025-06-30',
        review_type: 'semi_annual',
        status: 'self_review',
        goals: MOCK_GOALS.filter((g) => g.review_id === 5),
        created_at: '2025-01-10',
        updated_at: '2025-02-05'
    },
    {
        id: 6,
        employee_id: 8,
        employee_name: 'Исмоилова Шахло Равшановна',
        reviewer_id: 3,
        reviewer_name: 'Юлдашев Ботир Камолович',
        review_period_start: '2025-01-01',
        review_period_end: '2025-06-30',
        review_type: 'semi_annual',
        status: 'draft',
        goals: MOCK_GOALS.filter((g) => g.review_id === 6),
        created_at: '2025-02-01',
        updated_at: '2025-02-01'
    }
];

@Injectable({
    providedIn: 'root'
})
export class PerformanceService extends ApiService {
    // --- Goals ---

    getGoals(): Observable<PerformanceGoal[]> {
        return of(MOCK_GOALS).pipe(delay(300));
    }

    getGoal(id: number): Observable<PerformanceGoal> {
        const goal = MOCK_GOALS.find((g) => g.id === id);
        return of(goal as PerformanceGoal).pipe(delay(300));
    }

    createGoal(payload: GoalPayload): Observable<PerformanceGoal> {
        const newGoal: PerformanceGoal = {
            id: Date.now(),
            status: 'not_started',
            progress_percent: 0,
            weight: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            ...payload
        } as PerformanceGoal;
        return of(newGoal).pipe(delay(200));
    }

    updateGoal(id: number, payload: GoalPayload): Observable<PerformanceGoal> {
        const existing = MOCK_GOALS.find((g) => g.id === id);
        const updated = { ...existing, ...payload, updated_at: new Date().toISOString() } as PerformanceGoal;
        return of(updated).pipe(delay(200));
    }

    deleteGoal(id: number): Observable<any> {
        return of({ success: true }).pipe(delay(200));
    }

    // --- Reviews ---

    getReviews(): Observable<PerformanceReview[]> {
        return of(MOCK_REVIEWS).pipe(delay(300));
    }

    getReview(id: number): Observable<PerformanceReview> {
        const review = MOCK_REVIEWS.find((r) => r.id === id);
        return of(review as PerformanceReview).pipe(delay(300));
    }

    createReview(payload: PerformanceReviewPayload): Observable<PerformanceReview> {
        const newReview: PerformanceReview = {
            id: Date.now(),
            status: 'draft',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            ...payload,
            goals: payload.goals?.map((g, i) => ({ ...g, id: Date.now() + i, status: 'not_started' as const, progress_percent: 0 })) || []
        } as PerformanceReview;
        return of(newReview).pipe(delay(200));
    }

    updateReview(id: number, payload: Partial<PerformanceReview>): Observable<PerformanceReview> {
        const existing = MOCK_REVIEWS.find((r) => r.id === id);
        const updated = { ...existing, ...payload, updated_at: new Date().toISOString() } as PerformanceReview;
        return of(updated).pipe(delay(200));
    }

    deleteReview(id: number): Observable<any> {
        return of({ success: true }).pipe(delay(200));
    }
}
