import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, delay } from 'rxjs';
import { BASE_URL } from '@/core/services/api.service';
import { Competency, CompetencyPayload, CompetencyAssessment, AssessmentPayload, CompetencyMatrix } from '@/core/interfaces/hrm/competency';

const API_URL = BASE_URL + '/hrm/competencies';
const USE_MOCK = !BASE_URL;

// ===================== MOCK DATA =====================

const MOCK_COMPETENCIES: Competency[] = [
    {
        id: 1, name: 'Управление производством', description: 'Знание технологических процессов управления молокозаводом, включая пуск/останов агрегатов, контроль параметров, оперативное управление режимами.',
        category: 'technical',
        level_definitions: [
            { level: 1, name: 'Начальный', description: 'Знает основные принципы работы молокозавода, может выполнять базовые операции под руководством' },
            { level: 2, name: 'Базовый', description: 'Самостоятельно выполняет типовые операции по управлению агрегатами' },
            { level: 3, name: 'Уверенный', description: 'Уверенно управляет всеми режимами работы молокозавода, решает нестандартные ситуации' },
            { level: 4, name: 'Продвинутый', description: 'Оптимизирует режимы работы, обучает других, участвует в разработке регламентов' },
            { level: 5, name: 'Эксперт', description: 'Эксперт по управлению производством, разрабатывает стандарты, консультирует другие заводы' }
        ],
        created_at: '2025-01-15T08:00:00Z', updated_at: '2025-06-20T10:00:00Z'
    },
    {
        id: 2, name: 'Промышленная безопасность', description: 'Знание и соблюдение правил промышленной безопасности на объектах молочного производства, охрана труда, действия в аварийных ситуациях.',
        category: 'technical',
        level_definitions: [
            { level: 1, name: 'Начальный', description: 'Прошёл вводный инструктаж, знает основные правила ОТ' },
            { level: 2, name: 'Базовый', description: 'Соблюдает все правила безопасности, знает порядок действий при авариях' },
            { level: 3, name: 'Уверенный', description: 'Проводит инструктажи, выявляет нарушения, предлагает улучшения' },
            { level: 4, name: 'Продвинутый', description: 'Разрабатывает мероприятия по ОТ, проводит расследование инцидентов' },
            { level: 5, name: 'Эксперт', description: 'Формирует политику безопасности предприятия, аудитор систем ОТ' }
        ],
        created_at: '2025-01-15T08:00:00Z', updated_at: '2025-06-20T10:00:00Z'
    },
    {
        id: 3, name: 'Технология молочного производства', description: 'Знание технологии молочного производства и оборудования: пастеризаторы, сепараторы, распредустройства, автоматика и контроль качества.',
        category: 'technical',
        level_definitions: [
            { level: 1, name: 'Начальный', description: 'Базовые знания электротехники, понимает схемы простых цепей' },
            { level: 2, name: 'Базовый', description: 'Читает электрические схемы, обслуживает типовое оборудование' },
            { level: 3, name: 'Уверенный', description: 'Диагностирует неисправности, проводит наладку оборудования' },
            { level: 4, name: 'Продвинутый', description: 'Проектирует электрические схемы, настраивает РЗА' },
            { level: 5, name: 'Эксперт', description: 'Эксперт по оборудованию молокозавода, разрабатывает технические решения' }
        ],
        created_at: '2025-01-15T08:00:00Z', updated_at: '2025-06-20T10:00:00Z'
    },
    {
        id: 4, name: 'Производственные объекты', description: 'Знание конструкции, эксплуатации и мониторинга состояния производственных объектов: пастеризаторов, сепараторов, ёмкостей, холодильников.',
        category: 'technical',
        level_definitions: [
            { level: 1, name: 'Начальный', description: 'Знает назначение основных элементов производственных объектов' },
            { level: 2, name: 'Базовый', description: 'Проводит визуальные осмотры, фиксирует отклонения' },
            { level: 3, name: 'Уверенный', description: 'Анализирует данные мониторинга, оценивает состояние производственных объектов' },
            { level: 4, name: 'Продвинутый', description: 'Разрабатывает программы наблюдений, интерпретирует результаты' },
            { level: 5, name: 'Эксперт', description: 'Эксперт по безопасности производственных объектов, разрабатывает нормативы и методики' }
        ],
        created_at: '2025-01-15T08:00:00Z', updated_at: '2025-06-20T10:00:00Z'
    },
    {
        id: 5, name: 'АСУ ТП и SCADA', description: 'Владение автоматизированными системами управления технологическими процессами, SCADA-системами, программирование контроллеров.',
        category: 'technical',
        level_definitions: [
            { level: 1, name: 'Начальный', description: 'Знает интерфейс SCADA, может просматривать параметры' },
            { level: 2, name: 'Базовый', description: 'Работает с SCADA как оператор, выполняет команды управления' },
            { level: 3, name: 'Уверенный', description: 'Конфигурирует SCADA, настраивает сигнализации и тренды' },
            { level: 4, name: 'Продвинутый', description: 'Программирует ПЛК, разрабатывает экраны и алгоритмы' },
            { level: 5, name: 'Эксперт', description: 'Проектирует АСУ ТП, интегрирует системы, разрабатывает архитектуру' }
        ],
        created_at: '2025-02-01T08:00:00Z', updated_at: '2025-06-20T10:00:00Z'
    },
    {
        id: 6, name: 'Лидерство и управление командой', description: 'Способность руководить коллективом, ставить задачи, мотивировать, развивать сотрудников и управлять конфликтами.',
        category: 'leadership',
        level_definitions: [
            { level: 1, name: 'Начальный', description: 'Понимает роль лидера, может координировать небольшую группу' },
            { level: 2, name: 'Базовый', description: 'Эффективно руководит рабочей группой из 3–5 человек' },
            { level: 3, name: 'Уверенный', description: 'Управляет подразделением, делегирует, мотивирует, развивает' },
            { level: 4, name: 'Продвинутый', description: 'Руководит крупным отделом, формирует команду, управляет изменениями' },
            { level: 5, name: 'Эксперт', description: 'Стратегическое лидерство, формирует корпоративную культуру, менторит руководителей' }
        ],
        created_at: '2025-02-01T08:00:00Z', updated_at: '2025-06-20T10:00:00Z'
    },
    {
        id: 7, name: 'Коммуникация', description: 'Навыки деловой коммуникации: проведение совещаний, подготовка отчётов, ведение переговоров, публичные выступления.',
        category: 'soft',
        level_definitions: [
            { level: 1, name: 'Начальный', description: 'Может донести мысль в устной и письменной форме' },
            { level: 2, name: 'Базовый', description: 'Готовит отчёты, участвует в совещаниях, формулирует чётко' },
            { level: 3, name: 'Уверенный', description: 'Проводит совещания, ведёт переговоры, выступает перед аудиторией' },
            { level: 4, name: 'Продвинутый', description: 'Эффективный переговорщик, готовит презентации для руководства' },
            { level: 5, name: 'Эксперт', description: 'Представляет компанию на внешних площадках, формирует коммуникационную стратегию' }
        ],
        created_at: '2025-02-01T08:00:00Z', updated_at: '2025-06-20T10:00:00Z'
    },
    {
        id: 8, name: 'Принятие решений', description: 'Способность анализировать информацию, оценивать риски и принимать обоснованные управленческие и технические решения.',
        category: 'core',
        level_definitions: [
            { level: 1, name: 'Начальный', description: 'Принимает решения по типовым вопросам по инструкции' },
            { level: 2, name: 'Базовый', description: 'Анализирует ситуацию, принимает решения в рамках полномочий' },
            { level: 3, name: 'Уверенный', description: 'Принимает решения в условиях неопределённости, оценивает риски' },
            { level: 4, name: 'Продвинутый', description: 'Стратегические решения, анализ альтернатив, учёт долгосрочных последствий' },
            { level: 5, name: 'Эксперт', description: 'Принимает решения на уровне предприятия, формирует политику' }
        ],
        created_at: '2025-02-01T08:00:00Z', updated_at: '2025-06-20T10:00:00Z'
    },
    {
        id: 9, name: 'Производственный менеджмент', description: 'Знание принципов управления молочным производством, балансирование нагрузки, диспетчерское управление, эффективность производства.',
        category: 'functional',
        level_definitions: [
            { level: 1, name: 'Начальный', description: 'Понимает основы молочной отрасли и роль молокозавода в ней' },
            { level: 2, name: 'Базовый', description: 'Знает графики нагрузок, участвует в планировании режимов' },
            { level: 3, name: 'Уверенный', description: 'Оптимизирует режимы работы завода, взаимодействует с диспетчером' },
            { level: 4, name: 'Продвинутый', description: 'Разрабатывает планы производства, анализирует производственные режимы' },
            { level: 5, name: 'Эксперт', description: 'Формирует стратегию производства, взаимодействует с регулятором' }
        ],
        created_at: '2025-03-01T08:00:00Z', updated_at: '2025-06-20T10:00:00Z'
    },
    {
        id: 10, name: 'Работа в команде', description: 'Способность эффективно взаимодействовать с коллегами, вносить вклад в групповой результат, поддерживать позитивный климат.',
        category: 'soft',
        level_definitions: [
            { level: 1, name: 'Начальный', description: 'Выполняет свою часть работы, корректен в общении' },
            { level: 2, name: 'Базовый', description: 'Активно участвует в командной работе, помогает коллегам' },
            { level: 3, name: 'Уверенный', description: 'Инициирует совместную работу, разрешает разногласия' },
            { level: 4, name: 'Продвинутый', description: 'Объединяет команду вокруг общей цели, фасилитирует групповые процессы' },
            { level: 5, name: 'Эксперт', description: 'Выстраивает кросс-функциональное взаимодействие, развивает командную культуру' }
        ],
        created_at: '2025-03-01T08:00:00Z', updated_at: '2025-06-20T10:00:00Z'
    }
];

const MOCK_ASSESSMENTS: CompetencyAssessment[] = [
    {
        id: 1, employee_id: 101, employee_name: 'Каримов Бахтиёр Рустамович',
        department_name: 'Управление производством', position_name: 'Главный инженер',
        assessor_id: 200, assessor_name: 'Директор',
        assessment_date: '2026-01-20', assessment_type: 'manager', status: 'approved', overall_score: 4.4,
        competency_scores: [
            { id: 1, assessment_id: 1, competency_id: 1, competency_name: 'Управление производством', category: 'technical', expected_level: 5, actual_level: 5, gap: 0, notes: 'Эксперт. Многолетний опыт.' },
            { id: 2, assessment_id: 1, competency_id: 2, competency_name: 'Промышленная безопасность', category: 'technical', expected_level: 5, actual_level: 4, gap: -1, notes: 'Высокий уровень, нужна актуализация знаний по новым нормативам' },
            { id: 3, assessment_id: 1, competency_id: 3, competency_name: 'Технология молочного производства', category: 'technical', expected_level: 4, actual_level: 4, gap: 0 },
            { id: 4, assessment_id: 1, competency_id: 6, competency_name: 'Лидерство и управление командой', category: 'leadership', expected_level: 5, actual_level: 4, gap: -1, notes: 'Необходимо развивать делегирование' },
            { id: 5, assessment_id: 1, competency_id: 8, competency_name: 'Принятие решений', category: 'core', expected_level: 5, actual_level: 5, gap: 0, notes: 'Отличные навыки принятия решений в кризисных ситуациях' }
        ],
        feedback: 'Высококвалифицированный специалист. Рекомендуется развитие управленческих компетенций для перехода на позицию директора станции.',
        strengths: ['Управление производством', 'Принятие решений', 'Технология молочного производства'],
        development_areas: ['Лидерство', 'Промышленная безопасность (новые нормативы)'],
        career_recommendations: 'Кандидат на позицию директора молокозавода в перспективе 1–2 лет',
        created_at: '2026-01-20T10:00:00Z', updated_at: '2026-01-25T14:00:00Z'
    },
    {
        id: 2, employee_id: 104, employee_name: 'Абдуллаев Жасур Тохирович',
        department_name: 'Управление производством', position_name: 'Оператор производственной линии',
        assessor_id: 101, assessor_name: 'Каримов Бахтиёр Рустамович',
        assessment_date: '2026-02-10', assessment_type: 'manager', status: 'completed', overall_score: 3.2,
        competency_scores: [
            { id: 6, assessment_id: 2, competency_id: 1, competency_name: 'Управление производством', category: 'technical', expected_level: 3, actual_level: 3, gap: 0, notes: 'Уверенно управляет агрегатами' },
            { id: 7, assessment_id: 2, competency_id: 2, competency_name: 'Промышленная безопасность', category: 'technical', expected_level: 3, actual_level: 3, gap: 0 },
            { id: 8, assessment_id: 2, competency_id: 3, competency_name: 'Технология молочного производства', category: 'technical', expected_level: 3, actual_level: 2, gap: -1, notes: 'Нужны дополнительные знания по РЗА' },
            { id: 9, assessment_id: 2, competency_id: 5, competency_name: 'АСУ ТП и SCADA', category: 'technical', expected_level: 3, actual_level: 3, gap: 0, notes: 'Хорошо владеет SCADA' },
            { id: 10, assessment_id: 2, competency_id: 10, competency_name: 'Работа в команде', category: 'soft', expected_level: 3, actual_level: 4, gap: 1, notes: 'Превышает ожидания, отличный командный игрок' }
        ],
        feedback: 'Добросовестный оператор. Необходимо повысить квалификацию по электротехнике. Потенциал для роста до старшего оператора.',
        strengths: ['SCADA', 'Работа в команде', 'Управление производством'],
        development_areas: ['Технология молочного производства', 'Автоматика'],
        created_at: '2026-02-10T09:00:00Z', updated_at: '2026-02-15T11:00:00Z'
    },
    {
        id: 3, employee_id: 102, employee_name: 'Султанова Дилноза Камолидиновна',
        department_name: 'Финансово-экономический отдел', position_name: 'Ведущий экономист',
        assessor_id: 200, assessor_name: 'Директор',
        assessment_date: '2026-02-15', assessment_type: '360', status: 'in_progress', overall_score: 3.8,
        competency_scores: [
            { id: 11, assessment_id: 3, competency_id: 9, competency_name: 'Производственный менеджмент', category: 'functional', expected_level: 3, actual_level: 3, gap: 0 },
            { id: 12, assessment_id: 3, competency_id: 7, competency_name: 'Коммуникация', category: 'soft', expected_level: 4, actual_level: 4, gap: 0, notes: 'Отлично готовит отчёты и презентации' },
            { id: 13, assessment_id: 3, competency_id: 8, competency_name: 'Принятие решений', category: 'core', expected_level: 3, actual_level: 3, gap: 0 },
            { id: 14, assessment_id: 3, competency_id: 10, competency_name: 'Работа в команде', category: 'soft', expected_level: 4, actual_level: 4, gap: 0 }
        ],
        feedback: 'Квалифицированный экономист. Хорошо взаимодействует с техническими подразделениями.',
        strengths: ['Коммуникация', 'Работа в команде'],
        development_areas: ['Стратегическое планирование'],
        created_at: '2026-02-15T10:00:00Z', updated_at: '2026-02-20T14:00:00Z'
    }
];

const MOCK_MATRICES: CompetencyMatrix[] = [
    {
        id: 1, position_id: 10, position_name: 'Главный инженер',
        competencies: [
            { competency_id: 1, competency_name: 'Управление производством', required_level: 5, is_critical: true },
            { competency_id: 2, competency_name: 'Промышленная безопасность', required_level: 5, is_critical: true },
            { competency_id: 3, competency_name: 'Технология молочного производства', required_level: 4, is_critical: true },
            { competency_id: 4, competency_name: 'Производственные объекты', required_level: 4, is_critical: false },
            { competency_id: 6, competency_name: 'Лидерство и управление командой', required_level: 5, is_critical: true },
            { competency_id: 8, competency_name: 'Принятие решений', required_level: 5, is_critical: true },
            { competency_id: 9, competency_name: 'Производственный менеджмент', required_level: 4, is_critical: false }
        ],
        created_at: '2025-01-20T08:00:00Z'
    },
    {
        id: 2, position_id: 11, position_name: 'Оператор производственной линии',
        competencies: [
            { competency_id: 1, competency_name: 'Управление производством', required_level: 3, is_critical: true },
            { competency_id: 2, competency_name: 'Промышленная безопасность', required_level: 3, is_critical: true },
            { competency_id: 3, competency_name: 'Технология молочного производства', required_level: 3, is_critical: true },
            { competency_id: 5, competency_name: 'АСУ ТП и SCADA', required_level: 3, is_critical: false },
            { competency_id: 10, competency_name: 'Работа в команде', required_level: 3, is_critical: false }
        ],
        created_at: '2025-01-20T08:00:00Z'
    },
    {
        id: 3, position_id: 12, position_name: 'Инженер-технолог',
        competencies: [
            { competency_id: 4, competency_name: 'Производственные объекты', required_level: 4, is_critical: true },
            { competency_id: 2, competency_name: 'Промышленная безопасность', required_level: 3, is_critical: true },
            { competency_id: 1, competency_name: 'Управление производством', required_level: 2, is_critical: false },
            { competency_id: 7, competency_name: 'Коммуникация', required_level: 3, is_critical: false },
            { competency_id: 8, competency_name: 'Принятие решений', required_level: 3, is_critical: false }
        ],
        created_at: '2025-01-20T08:00:00Z'
    },
    {
        id: 4, position_id: 60, position_name: 'Инженер АСУ ТП',
        competencies: [
            { competency_id: 5, competency_name: 'АСУ ТП и SCADA', required_level: 5, is_critical: true },
            { competency_id: 3, competency_name: 'Технология молочного производства', required_level: 3, is_critical: false },
            { competency_id: 2, competency_name: 'Промышленная безопасность', required_level: 3, is_critical: true },
            { competency_id: 8, competency_name: 'Принятие решений', required_level: 3, is_critical: false },
            { competency_id: 10, competency_name: 'Работа в команде', required_level: 3, is_critical: false }
        ],
        created_at: '2025-02-15T08:00:00Z'
    }
];

const MOCK_GAP_ANALYSIS = {
    employee_id: 104,
    employee_name: 'Абдуллаев Жасур Тохирович',
    position_name: 'Оператор производственной линии',
    overall_fit_percentage: 85,
    gaps: [
        { competency_id: 3, competency_name: 'Технология молочного производства', required_level: 3, actual_level: 2, gap: -1, priority: 'high', recommended_actions: ['Курс по технологии производства', 'Стажировка в производственном цехе'] }
    ],
    strengths: [
        { competency_id: 10, competency_name: 'Работа в команде', required_level: 3, actual_level: 4, surplus: 1 }
    ]
};

const MOCK_COMPETENCY_REPORT = {
    total_employees_assessed: 3,
    avg_overall_score: 3.8,
    competency_averages: [
        { competency_id: 1, competency_name: 'Управление производством', avg_score: 4.0, total_assessed: 2 },
        { competency_id: 2, competency_name: 'Промышленная безопасность', avg_score: 3.5, total_assessed: 2 },
        { competency_id: 3, competency_name: 'Технология молочного производства', avg_score: 3.0, total_assessed: 2 },
        { competency_id: 7, competency_name: 'Коммуникация', avg_score: 4.0, total_assessed: 1 },
        { competency_id: 8, competency_name: 'Принятие решений', avg_score: 4.0, total_assessed: 2 },
        { competency_id: 10, competency_name: 'Работа в команде', avg_score: 4.0, total_assessed: 2 }
    ],
    top_gaps: [
        { competency_id: 3, competency_name: 'Технология молочного производства', avg_gap: -0.5 },
        { competency_id: 6, competency_name: 'Лидерство и управление командой', avg_gap: -1.0 }
    ]
};

// ===================== SERVICE =====================

@Injectable({
    providedIn: 'root'
})
export class CompetencyService {
    private http = inject(HttpClient);

    // Competencies
    getCompetencies(category?: string): Observable<Competency[]> {
        if (USE_MOCK) {
            let result = [...MOCK_COMPETENCIES];
            if (category) result = result.filter((c) => c.category === category);
            return of(result).pipe(delay(200));
        }
        let params = new HttpParams();
        if (category) {
            params = params.set('category', category);
        }
        return this.http.get<Competency[]>(API_URL, { params });
    }

    getCompetencyById(id: number): Observable<Competency> {
        if (USE_MOCK) return of(MOCK_COMPETENCIES.find((c) => c.id === id) || MOCK_COMPETENCIES[0]).pipe(delay(200));
        return this.http.get<Competency>(`${API_URL}/${id}`);
    }

    createCompetency(payload: CompetencyPayload): Observable<Competency> {
        if (USE_MOCK) {
            const newCompetency: Competency = {
                id: Date.now(), ...payload,
                created_at: new Date().toISOString(), updated_at: new Date().toISOString()
            };
            return of(newCompetency).pipe(delay(200));
        }
        return this.http.post<Competency>(API_URL, payload);
    }

    updateCompetency(id: number, payload: Partial<CompetencyPayload>): Observable<Competency> {
        if (USE_MOCK) {
            const competency = MOCK_COMPETENCIES.find((c) => c.id === id) || MOCK_COMPETENCIES[0];
            return of({ ...competency, ...payload, updated_at: new Date().toISOString() } as Competency).pipe(delay(200));
        }
        return this.http.put<Competency>(`${API_URL}/${id}`, payload);
    }

    deleteCompetency(id: number): Observable<void> {
        if (USE_MOCK) return of(void 0).pipe(delay(200));
        return this.http.delete<void>(`${API_URL}/${id}`);
    }

    // Assessments
    getAssessments(params?: { employee_id?: number; status?: string }): Observable<CompetencyAssessment[]> {
        if (USE_MOCK) {
            let result = [...MOCK_ASSESSMENTS];
            if (params?.employee_id) result = result.filter((a) => a.employee_id === params.employee_id);
            if (params?.status) result = result.filter((a) => a.status === params.status);
            return of(result).pipe(delay(200));
        }
        let httpParams = new HttpParams();
        if (params?.employee_id) {
            httpParams = httpParams.set('employee_id', params.employee_id.toString());
        }
        if (params?.status) {
            httpParams = httpParams.set('status', params.status);
        }
        return this.http.get<CompetencyAssessment[]>(`${API_URL}/assessments`, { params: httpParams });
    }

    getAssessmentById(id: number): Observable<CompetencyAssessment> {
        if (USE_MOCK) return of(MOCK_ASSESSMENTS.find((a) => a.id === id) || MOCK_ASSESSMENTS[0]).pipe(delay(200));
        return this.http.get<CompetencyAssessment>(`${API_URL}/assessments/${id}`);
    }

    createAssessment(payload: AssessmentPayload): Observable<CompetencyAssessment> {
        if (USE_MOCK) {
            const newAssessment: CompetencyAssessment = {
                id: Date.now(), employee_id: payload.employee_id, employee_name: 'Сотрудник',
                assessor_id: 200, assessor_name: 'Администратор',
                assessment_date: new Date().toISOString().split('T')[0],
                assessment_type: payload.assessment_type, status: 'draft',
                competency_scores: payload.competency_scores.map((s, i) => ({
                    id: Date.now() + i, assessment_id: Date.now(), competency_id: s.competency_id,
                    expected_level: 3, actual_level: s.actual_level, gap: s.actual_level - 3, notes: s.notes
                })),
                feedback: payload.feedback,
                created_at: new Date().toISOString(), updated_at: new Date().toISOString()
            };
            return of(newAssessment).pipe(delay(200));
        }
        return this.http.post<CompetencyAssessment>(`${API_URL}/assessments`, payload);
    }

    updateAssessment(id: number, payload: Partial<AssessmentPayload>): Observable<CompetencyAssessment> {
        if (USE_MOCK) {
            const assessment = MOCK_ASSESSMENTS.find((a) => a.id === id) || MOCK_ASSESSMENTS[0];
            return of({ ...assessment, ...payload, updated_at: new Date().toISOString() } as CompetencyAssessment).pipe(delay(200));
        }
        return this.http.put<CompetencyAssessment>(`${API_URL}/assessments/${id}`, payload);
    }

    deleteAssessment(id: number): Observable<void> {
        if (USE_MOCK) return of(void 0).pipe(delay(200));
        return this.http.delete<void>(`${API_URL}/assessments/${id}`);
    }

    completeAssessment(id: number): Observable<CompetencyAssessment> {
        if (USE_MOCK) {
            const assessment = MOCK_ASSESSMENTS.find((a) => a.id === id) || MOCK_ASSESSMENTS[0];
            return of({ ...assessment, status: 'completed' as const, updated_at: new Date().toISOString() }).pipe(delay(200));
        }
        return this.http.post<CompetencyAssessment>(`${API_URL}/assessments/${id}/complete`, {});
    }

    getEmployeeAssessments(employeeId: number): Observable<CompetencyAssessment[]> {
        if (USE_MOCK) return of(MOCK_ASSESSMENTS.filter((a) => a.employee_id === employeeId)).pipe(delay(200));
        return this.http.get<CompetencyAssessment[]>(`${API_URL}/employees/${employeeId}/assessments`);
    }

    // Competency Matrix
    getMatrices(): Observable<CompetencyMatrix[]> {
        if (USE_MOCK) return of(MOCK_MATRICES).pipe(delay(200));
        return this.http.get<CompetencyMatrix[]>(`${API_URL}/matrices`);
    }

    getMatrixByPosition(positionId: number): Observable<CompetencyMatrix> {
        if (USE_MOCK) return of(MOCK_MATRICES.find((m) => m.position_id === positionId) || MOCK_MATRICES[0]).pipe(delay(200));
        return this.http.get<CompetencyMatrix>(`${API_URL}/matrices/position/${positionId}`);
    }

    createMatrix(positionId: number, competencies: { competency_id: number; required_level: number; is_critical: boolean }[]): Observable<CompetencyMatrix> {
        if (USE_MOCK) {
            const newMatrix: CompetencyMatrix = {
                id: Date.now(), position_id: positionId,
                competencies: competencies.map((c) => ({
                    competency_id: c.competency_id, competency_name: MOCK_COMPETENCIES.find((mc) => mc.id === c.competency_id)?.name || 'Компетенция',
                    required_level: c.required_level, is_critical: c.is_critical
                })),
                created_at: new Date().toISOString()
            };
            return of(newMatrix).pipe(delay(200));
        }
        return this.http.post<CompetencyMatrix>(`${API_URL}/matrices`, { position_id: positionId, competencies });
    }

    updateMatrix(id: number, competencies: { competency_id: number; required_level: number; is_critical: boolean }[]): Observable<CompetencyMatrix> {
        if (USE_MOCK) {
            const matrix = MOCK_MATRICES.find((m) => m.id === id) || MOCK_MATRICES[0];
            const updatedMatrix: CompetencyMatrix = {
                ...matrix,
                competencies: competencies.map((c) => ({
                    competency_id: c.competency_id, competency_name: MOCK_COMPETENCIES.find((mc) => mc.id === c.competency_id)?.name || 'Компетенция',
                    required_level: c.required_level, is_critical: c.is_critical
                }))
            };
            return of(updatedMatrix).pipe(delay(200));
        }
        return this.http.put<CompetencyMatrix>(`${API_URL}/matrices/${id}`, { competencies });
    }

    // Gap Analysis
    getGapAnalysis(employeeId: number): Observable<any> {
        if (USE_MOCK) return of({ ...MOCK_GAP_ANALYSIS, employee_id: employeeId }).pipe(delay(200));
        return this.http.get<any>(`${API_URL}/employees/${employeeId}/gap-analysis`);
    }

    // Reports
    getCompetencyReport(params?: { department_id?: number; competency_id?: number }): Observable<any> {
        if (USE_MOCK) return of(MOCK_COMPETENCY_REPORT).pipe(delay(200));
        let httpParams = new HttpParams();
        if (params?.department_id) {
            httpParams = httpParams.set('department_id', params.department_id.toString());
        }
        if (params?.competency_id) {
            httpParams = httpParams.set('competency_id', params.competency_id.toString());
        }
        return this.http.get<any>(`${API_URL}/reports`, { params: httpParams });
    }
}
